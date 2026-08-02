# 🎓 Diretrizes de Governança — Site Acadêmico Estático (saoncv.github.io)

Este repositório contém o código-fonte do site acadêmico pessoal hospedado via GitHub Pages.

---

## 1. Alinhamento & Classificação de Risco
- **Classificação de Risco:**
  - **Baixo Risco:** Atualização de publicações, correções tipográficas, inclusão de links, ajustes pontuais de CSS. Prossiga com agilidade.
    - **Timeline de Atualizações:** Inclusões de itens na seção "Últimas Notícias" da página inicial (ex: participação em bancas, submissões no alphaXiv ou publicação de novos pacotes). A adição deve ser no topo da lista HTML, respeitando o formato de data estabelecido, removendo itens muito antigos (pruning) para manter o DOM leve.
  - **Alto Risco:** Refatoração de `style.css`, alteração da estrutura semântica em `index.html`, ou mudanças na lógica de `script.js`. Monte um plano explícito e valide antes de editar.
- **Proibição da Escolha Silenciosa:** Se houver dúvida visual ou funcional sobre o layout, pergunte e apresente alternativas antes de modificar o código.

---

## 2. Simplificação & Padrões Web
- **HTML Semântico & Acessibilidade:** Priorize elementos nativos do HTML5 (`<main>`, `<article>`, `<nav>`) e boas práticas de acessibilidade (A11y, labels, contraste).
- **Sem Future-Proofing / Minimalismo:** Mantenha o projeto leve. Evite introduzir frameworks ou bibliotecas JS/CSS externas pesadas a menos que estritamente necessário.
- **Respeito ao GitHub Pages:** Mantenha a compatibilidade com o GitHub Pages (preservação do `.nojekyll` e links relativos).
- **Indexação Acadêmica (SEO & Scholar):** Estruture páginas de publicações com meta-tags acadêmicas padrão (Highwire Press tags, ex: `citation_author`, `citation_title`) para garantir o correto *parsing* automático pelo Google Scholar e outros indexadores de pesquisa.
- **Visualizações e Performance Computacional:**
  - **Simuladores Interativos & Laboratórios Didáticos (JS/WebGL):** Simuladores com propósitos didáticos, educacionais ou de recrutamento que exijam interação do usuário em tempo real (ex: FLIP 2D, escoamento multifásico) devem ser desenvolvidos estritamente em JavaScript/Canvas/WebGL Vanilla, sem dependências de frameworks pesados.
  - **Demonstração Passiva de Resultados:** A demonstração apenas visual/passiva de resultados de pesquisa ou simulações pesadas não-interativas deve utilizar tags `<video>` nativas com formatos compactados (MP4/WebM) contendo obrigatoriamente os atributos `muted autoplay loop playsinline`. Ao importar embeds externos, a tag `<iframe>` exige o atributo `loading="lazy"`. GIFs pesados são proibidos.

---

## 3. Alterações Cirúrgicas
- **Escopo Estrito:** Modifique apenas os arquivos e linhas necessários para a solicitação. É proibido reformatar código não relacionado (*drive-by refactorings*).
- **Estacione o Pensamento (`.agents/sidenotes.md`):** Se identificar CSS não utilizado ou oportunidade de refatoração fora do escopo, anote em `.agents/sidenotes.md` e não execute na hora.
- **Limpeza de Restos:** Se suas alterações deixarem seletores CSS ou funções JS órfãs, remova-as.

---

## 4. Execução Verificável
- **Regra da Evidência:** Não declare uma alteração pronta apenas com palavras. Valide a renderização e o comportamento no console/DevTools antes de concluir.
- **Checkpoints Git:** Exija a inspeção do `git diff` local antes de alterações destrutivas.
- **Filtro de Artefatos:** Antes de qualquer `git push`, garanta que o `.gitignore` esteja bloqueando a subida de arquivos de ambiente (`.env`), arquivos temporários do SO (como `.DS_Store`) ou logs locais. O diretório raiz deve conter estritamente o código de distribuição e configuração do Pages.

---

## 5. Tom de Comunicação
- Respostas diretas, técnicas e sem linguagem de preenchimento.

---

## 6. Privacidade, Segurança & LGPD
- **Zero Rastreamento (Privacy by Default):** Não utilize cookies ou scripts de analytics invasivos (como Google Analytics) para evitar a necessidade de banners de LGPD/GDPR. Se métricas forem vitais, prefira alternativas server-side nativas do GitHub ou scripts *cookieless*.
- **Proteção de Links Externos:** Todo link que abrir em nova aba (`target="_blank"`) deve obrigatoriamente conter `rel="noopener noreferrer"` para mitigar ataques de *Reverse Tabnabbing*.
- **Ofuscação de Contato & Handler Universal:** É proibido expor o e-mail em texto puro ou `mailto:` simples no HTML (alvo fácil para *spambots*). O acionamento de contato por e-mail deve utilizar obrigatoriamente o atributo `data-contact="saon"` associado ao handler JS universal (`script.js`), o qual reconstrói dinamicamente o link `mailto:saon@unicamp.br` somente após a interação do usuário.
- **Integridade de Sub-recursos (SRI):** Havendo a necessidade extrema de importar um script ou estilo via CDN (ex: Fontes, ícones), a tag de importação deve obrigatoriamente incluir os atributos `integrity` (hash criptográfico) e `crossorigin="anonymous"`.
- **Nenhuma Chave no Frontend:** Nenhuma chave de API, mesmo as que pareçam inofensivas, deve ser "hardcoded" no repositório público.

---

## 7. Arquitetura da Informação & Open Science
- **A Tríade de Publicação:** Toda entrada de artigo deve apresentar, sempre que existir, três links de acesso rápido:
  1. O DOI ou link oficial da revista/evento (ex: anais do COBEM).
  2. O link para a e-print/preprint de acesso livre.
  3. O link direto para o repositório de dados ou código da pesquisa.
- **Separação Categórica de Artefatos:** Mantenha divisões semânticas rígidas no HTML para separar as entregas profissionais:
  - **Pesquisa Acadêmica:** Artigos, preprints e trabalhos em congressos.
  - **Software & Automação:** Ferramentas open-source, pacotes estruturados e scripts de terminal desenvolvidos e mantidos no GitHub (ex: `gerar_projeto_python`).
  - **Material Didático:** Slides, ementas, materiais de aula para a faculdade de Engenharia Mecânica e notebooks educacionais interativos.
- **Escaneabilidade Técnica:** Ao linkar projetos de código, utilize tags textuais curtas ao lado do link para indicar a tecnologia base (ex: `[Python]`, `[Graph RAG]`).
- **Internacionalização Bilíngue (PT / EN):** Todo conteúdo e atualização em `index.html` (Português) deve ter paridade completa mantida de forma síncrona em `index-en.html` (Inglês), incluindo os atributos `<html lang="...">` e o seletor de idiomas no cabeçalho. O mesmo se aplica estritamente a subpáginas dedicadas de laboratório (`phi-lab.html` e `phi-lab-en.html`).
- **Manifesto de Ciência Aberta (Open Science & Open Access):** Toda seção de publicações deve conter o aviso explícito de compromisso com a ciência aberta e acesso livre, fornecendo links diretos para os DOIs, e-prints e código-fonte dos artigos.
- **Subpáginas de Laboratórios & Ecossistemas de Pesquisa (PHI Lab):** As subpáginas do PHI Lab (`phi-lab.html` e `phi-lab-en.html`) contêm o manifesto científico, missão, visão, os cinco princípios e os seis programas permanentes de pesquisa do laboratório associado ao ALFA Lab / CEPETRO / FEM / UNICAMP. Toda nova iniciativa ou alteração nesses programas deve ser refletida síncronamente em ambas as línguas.
- **Redes Globais de Colaboração Científica (PHI Lab):** As seções relativas às colaborações científicas internacionais na subpágina do PHI Lab devem manter simetria bilíngue estrita (PT/EN), detalhando domínios de pesquisa, instituições parceiras (ex: Imperial College London, TU Delft, MIT) e contatos chave.

---

## 8. Protocolo de Prospecção & Ingestão de Dados (Pesquisa Web, Patentes & Notícias)
- **Fontes Primárias & Crawling Direcionado:** Ao coletar ou atualizar informações sobre o perfil do autor, projetos, prêmios ou publicações, consulte obrigatoriamente as seguintes bases primárias:
  - **Currículo Lattes (CNPq):** Base soberana para biografia oficial, cronologia de carreira, lista completa de artigos em periódicos, capítulos, patentes depositadas/concedidas e bancas.
  - **Google Scholar & Scopus:** Verificação de DOIs, contagem de citações e títulos oficiais de artigos.
  - **Agência de Inovação Inova Unicamp & Revista CEPETRO:** Coleta de notícias sobre o Prêmio Inventores Unicamp, Desafio Unicamp de Empreendedorismo e parcerias tecnológicas.
  - **Portais Oficiais da Petrobras & INPI/USPTO:** Confirmação de patentes registradas e Prêmio Inventor Petrobras.
- **Validação Cruzada de Colaboradores:** Ao realizar buscas web por novidades ou premiações do grupo de pesquisa, utilize os nomes de colaboradores e coautores frequentes (ex: Marcelo Souza de Castro, Juliana Cenzi, Daniely Amorim, Adriano Fabro, Bernardo Foresti) para localizar matérias de imprensa, projetos conjuntos e patentes correlatas.
- **Triagem & Inclusão de Links Oficiais:** Notícias de prêmios ou patentes adicionadas à seção "Últimas Notícias" devem obrigatoriamente conter links externos diretos para as matérias oficiais ou portais institucionais (com `target="_blank" rel="noopener noreferrer"`).
- **Paridade Bilíngue Automatizada:** Qualquer dado ou prêmio ingerido a partir do Lattes ou pesquisas web deve ser traduzido e adicionado síncronamente tanto na versão em Português quanto na versão em Inglês.

---

## 9. Governança de Mídia, Branding & Navegação Espelhada
- **Rastreamento Estrito de Assets de Imagem (`.gitignore`):** Imagens oficiais de branding, logos institucionais, fotos de perfil ou mascotes de laboratórios adicionados ao diretório `assets/` devem obrigatoriamente ser versionados no Git. Regras genéricas de exclusão de mídias (ex: `*.png`, `*.jpg`) no `.gitignore` são proibidas no diretório de distribuição pública `assets/`.
- **Simbologia Emblemática Nativa (SVG First):** Marcas e logos de instituições acadêmicas (ex: UNICAMP) e centros de pesquisa (ex: CEPETRO) devem priorizar renderizações vetoriais SVG nativas e ícones representativos temáticos (ex: gota de óleo para CEPETRO), evitando o uso de links de imagens externas sujeitos a quebras ou falhas de CORS/servidor.
- **Hierarquia Visual da Página Inicial:** O simulador didático interativo (ex: FLIP 2D em WebGL) deve figurar imediatamente abaixo do cartão de cabeçalho com a identificação pessoal e links oficiais, garantindo engajamento e destaque pedagógico prioritário no topo da página.
- **Orientações de Interatividade em Simuladores Canvas/WebGL:** Qualquer elemento gráfico ou simulador didático interativo (ex: esfera obstáculo com máscara do mascote) deve possuir instrução textual explicativa nos subtítulos (ex: orientação para arrastar a esfera), garantindo usabilidade e acessibilidade em ambas as línguas (PT/EN).
- **Navegabilidade e Controles Espelhados (Sistemas Pessoal & PHI Lab):** Toda página do ecossistema (`index.html`, `index-en.html`, `phi-lab.html`, `phi-lab-en.html`) deve conter exatamente a mesma estrutura de controles superiores (`.top-nav-controls`):
  - **Canto Esquerdo (Alternador de Página):** Pílula com seleção ativa/inativa entre *Perfil Pessoal* e *PHI Lab — Physics-informed Hybrid Intelligence*.
  - **Canto Direito (Alternador de Idioma):** Pílula com seleção ativa/inativa de idioma utilizando bandeiras vetorizadas (`PT 🇧🇷 | EN 🇺🇸`).
- **Validação de Oferta Didática:** Atualizações na lista de disciplinas ministradas devem respeitar a rigorosa vinculação de curso/curso de origem (ex: *Engenharia Térmica I & II* vinculada à Graduação em Engenharia de Controle e Automação; *Mecânica dos Fluidos I & II* à Graduação em Engenharia Mecânica). Disciplinas inativas ou canceladas devem ser removidas sem deixar resíduos.
- **Estruturação de Chamadas Estratégicas (P&D Industrial & Orientação Acadêmica):** As seções destinadas à atração de financiamento de P&D (cláusula ANP/FINEP com operadoras de energia) e orientação de alunos (IC/TCC/Mestrado/Doutorado) devem ser mantidas espelhadas em ambas as línguas na página principal, fornecendo pontos diretos de contato por e-mail com manipulação ofuscada de endereço via JavaScript para mitigar spambots.
