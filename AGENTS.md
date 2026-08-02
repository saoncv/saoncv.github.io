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
- **Ofuscação de Contato:** É proibido expor o e-mail em texto puro ou `mailto:` simples no HTML (alvo fácil para *spambots*). Utilize ofuscação que preserve a usabilidade e copiabilidade por humanos (ex: codificação de entidades HTML `&#64;`, JS leve ou montagem no clique).
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
