import os
import xml.etree.ElementTree as ET
import requests
import yaml
from jinja2 import Environment, FileSystemLoader

print("=== Iniciando Build do Site Estático (SSG) ===")

# 1. Parse do Lattes XML
lattes_file = "data/curriculo.xml"
papers = []
if os.path.exists(lattes_file):
    print(f"Lendo Lattes XML: {lattes_file}")
    tree = ET.parse(lattes_file)
    root = tree.getroot()
    
    # Extrair artigos
    artigos_node = root.find(".//ARTIGOS-PUBLICADOS")
    if artigos_node is not None:
        for artigo in artigos_node.findall("ARTIGO-PUBLICADO"):
            dados = artigo.find("DADOS-BASICOS-DO-ARTIGO")
            detalhes = artigo.find("DETALHAMENTO-DO-ARTIGO")
            
            autores_list = []
            for autor in artigo.findall("AUTORES"):
                autores_list.append(autor.attrib.get("NOME-PARA-CITACAO", ""))
            
            paper = {
                "title": dados.attrib.get("TITULO-DO-ARTIGO", ""),
                "year": dados.attrib.get("ANO-DO-ARTIGO", ""),
                "doi": dados.attrib.get("DOI", ""),
                "journal": detalhes.attrib.get("NOME-DO-PERIODICO-OU-REVISTA", ""),
                "authors": ", ".join(autores_list),
                "citations": "N/A"
            }
            papers.append(paper)
else:
    print(f"ERRO: Lattes XML não encontrado em {lattes_file}")

# 2. Ingestão do OpenAlex
print("Buscando citações no OpenAlex...")
headers = {'User-Agent': 'mailto:saon@unicamp.br'}
for p in papers:
    if p["doi"]:
        doi_url = f"https://api.openalex.org/works/https://doi.org/{p['doi']}"
        try:
            resp = requests.get(doi_url, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                p["citations"] = data.get("cited_by_count", 0)
                print(f"  [OK] {p['doi']} -> {p['citations']} citações")
            else:
                print(f"  [FALHA] OpenAlex não encontrou DOI: {p['doi']}")
        except Exception as e:
            print(f"  [ERRO] Falha de conexão: {e}")

# 3. Ler Arquivos YAML auxiliares
def load_yaml(filename):
    if os.path.exists(f"data/{filename}"):
        with open(f"data/{filename}", "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {}

noticias = load_yaml("noticias.yml")
pesquisa = load_yaml("pesquisa.yml")
equipe = load_yaml("equipe.yml")

# 4. Configurar Jinja2 e compilar
env = Environment(loader=FileSystemLoader("src"))

# Para evitar substituir todo o HTML manualmente no Jinja, vamos injetar dinamicamente as strings de publicações no publicacoes.html!
pub_template = """
{% for pub in papers %}
<article class="pub-item" data-category="journal">
  <h3 class="pub-title">{{ pub.title }}</h3>
  <p class="pub-authors">{{ pub.authors }}</p>
  <p class="pub-journal">{{ pub.journal }}, {{ pub.year }} | <strong>Citações: {{ pub.citations }} (OpenAlex)</strong></p>
  <div class="pub-actions">
    <a href="https://doi.org/{{ pub.doi }}" target="_blank" rel="noopener noreferrer" class="action-badge doi-link">DOI Oficial</a>
    <span class="action-badge prestige-badge">Artigo em Periódico</span>
    <button class="bibtex-btn" onclick="toggleBibTeX('bib-{{ loop.index }}')">BibTeX</button>
  </div>
  <div class="bibtex-box" id="bib-{{ loop.index }}">
    <button class="copy-bib-btn" onclick="copyBibTeX('bib-{{ loop.index }}', this)">Copiar</button>
@article{paper{{ loop.index }},
  title={ {{ pub.title }} },
  author={ {{ pub.authors }} },
  journal={ {{ pub.journal }} },
  year={ {{ pub.year }} },
  doi={ {{ pub.doi }} }
}
  </div>
</article>
{% endfor %}
"""

# Vamos renderizar os blocos em python e usar BeautifulSoup para injetar nos arquivos estáticos, mantendo a robustez.
from bs4 import BeautifulSoup
import glob

# Renderiza a string de publicações
from jinja2 import Template
pubs_html = Template(pub_template).render(papers=papers)

# Para cada arquivo em src, nós abrimos, parseamos e escrevemos para a raiz.
for filepath in glob.glob("src/*.html"):
    filename = os.path.basename(filepath)
    print(f"Processando {filename}...")
    
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        
    # Injeta publicações se for a página de publicações
    if filename in ["publicacoes.html", "publicacoes-en.html"]:
        container = soup.find(id="pub-container")
        if container:
            container.clear()
            container.append(BeautifulSoup(pubs_html, "html.parser"))
            
    # Salva na raiz
    with open(f"./{filename}", "w", encoding="utf-8") as f:
        f.write(str(soup))

print("=== Build finalizado com sucesso! ===")
