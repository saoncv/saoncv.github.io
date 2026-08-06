# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "beautifulsoup4",
#     "requests",
#     "pyyaml",
#     "jinja2",
# ]
# ///

import os
import requests
import yaml
from jinja2 import Environment, FileSystemLoader
from bs4 import BeautifulSoup
import glob

print("=== Iniciando Build do Site Estático (SSG KISS) ===")

# 1. Ingestão do OpenAlex (Fonte da Verdade Única)
AUTHOR_ID = "A5035610220"
print(f"Buscando publicações do autor {AUTHOR_ID} no OpenAlex...")

headers = {'User-Agent': 'mailto:saon@unicamp.br'}
url = f"https://api.openalex.org/works?filter=author.id:{AUTHOR_ID}&sort=publication_year:desc&per-page=50"

papers = []
try:
    resp = requests.get(url, headers=headers, timeout=15)
    if resp.status_code == 200:
        data = resp.json()
        for work in data.get("results", []):
            title = work.get("title", "Sem Título")
            year = work.get("publication_year", "")
            doi_raw = work.get("doi")
            doi = doi_raw.replace("https://doi.org/", "") if doi_raw else ""
            citations = work.get("cited_by_count", 0)
            
            # Extrair nome da revista
            journal = "Revista Desconhecida"
            primary_location = work.get("primary_location")
            if primary_location:
                source = primary_location.get("source")
                if source:
                    journal = source.get("display_name", journal)
                    
            # Extrair autores
            authors_list = []
            for authorship in work.get("authorships", []):
                author_name = authorship.get("author", {}).get("display_name", "")
                authors_list.append(author_name)
            authors_str = ", ".join(authors_list)
            
            papers.append({
                "title": title,
                "year": year,
                "doi": doi,
                "journal": journal,
                "authors": authors_str,
                "citations": citations
            })
        print(f"  [OK] {len(papers)} artigos encontrados e processados.")
    else:
        print(f"  [FALHA] Erro na API do OpenAlex: {resp.status_code}")
except Exception as e:
    print(f"  [ERRO] Falha de conexão com OpenAlex: {e}")

# 2. Ler Arquivos YAML auxiliares
def load_yaml(filename):
    if os.path.exists(f"data/{filename}"):
        with open(f"data/{filename}", "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {}

noticias = load_yaml("noticias.yml")
pesquisa = load_yaml("pesquisa.yml")
equipe = load_yaml("equipe.yml")

# 3. Configurar Jinja2 e compilar
env = Environment(loader=FileSystemLoader("src"))

pub_template = """
{% for pub in papers %}
<article class="pub-item" data-category="journal">
  <h3 class="pub-title">{{ pub.title }}</h3>
  <p class="pub-authors">{{ pub.authors }}</p>
  <p class="pub-journal">{{ pub.journal }}, {{ pub.year }} | <strong>Citações: {{ pub.citations }} (OpenAlex)</strong></p>
  <div class="pub-actions">
    {% if pub.doi %}
    <a href="https://doi.org/{{ pub.doi }}" target="_blank" rel="noopener noreferrer" class="action-badge doi-link">DOI Oficial</a>
    {% endif %}
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
