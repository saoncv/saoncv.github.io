# 📝 Sidenotes — saoncv.github.io

Este arquivo registra dívidas técnicas, ideias de refatoração e otimizações identificadas fora do escopo imediato das tarefas ativas.

---

## Otimizações Realizadas (2026-08-05)
- **SEO & Microdados Acadêmicos**:
  - Implementação de `rel="canonical"` e `rel="alternate" hreflang` cruzados em `index.html`, `index-en.html`, `phi-lab.html` e `phi-lab-en.html`.
  - Inclusão de OpenGraph (`og:profile` / `og:website`), Twitter Cards (`summary_large_image`) e dados estruturados Schema.org JSON-LD (`Person` e `ResearchOrganization`).
- **Performance WebGL**:
  - Adição de `IntersectionObserver` em `script.js` para pausar o loop `requestAnimationFrame` do simulador FLIP quando o canvas rola para fora da viewport, reduzindo consumo de CPU/GPU e bateria em dispositivos móveis.
- **Acessibilidade A11y**:
  - Atributos `role="img"` e `aria-label` adicionados ao elemento `<canvas id="myCanvas">` em PT e EN.

- **Melhorias Inspiradas no Site de Bernat Font (TU Delft & Tema TeXt)**:
  - Adição do botão alternador de Tema Claro / Escuro (`Light / Dark Mode`) com persistência em `localStorage` e suporte ao tema do sistema operacional.
  - Implementação da **Barra de Navegação Acadêmica Superior Fixa** (`academic-nav`) com atalhos de seção (`#news`, `#research`, `#patents`, `#publications`, `#software`, `#partnerships`) nas 4 páginas.
  - Integração da biblioteca KaTeX com hashes criptográficos **SRI** (`integrity` e `crossorigin="anonymous"`) para suporte a fórmulas matemáticas LaTeX ($\Delta P(t)$, Navier-Stokes e perdas PINN $\mathcal{L}$).
  - Implementação do cartão visual destacado **Manifesto de Ciência Aberta & Acesso Livre** exibindo a **Tríade de Publicação** (DOI Oficial, Preprint/e-Print gratuito e Código/Dados Abertos no GitHub).
  - Expansão da seção de **Softwares & Automação Open-Source** com cartões detalhados para o Simulador WebGL, Pacote de Processamento de Sinais e Automação via Graph RAG com tags de tecnologia (`[WebGL / JS]`, `[Python]`, `[Graph RAG]`).

## Oportunidades Futuras de Refatoração
- **Automação CI/CD de Validação Paritária**:
  - Script Python / GitHub Action para checar automaticamente paridade de IDs e links entre `index.html` e `index-en.html` a cada commit.
- **Preloading & Imagens**:
  - Considerar a adição de `fetchpriority="high"` nas fotos de perfil principais em `assets/` para otimização de LCP (Largest Contentful Paint).
