# Daily Stoic View

<p align="center">
  <img src="https://img.shields.io/github/deployments/danhpaiva/DailyStoicView-html-css-js/github-pages?label=deploy&logo=github&style=flat-square" alt="Deploy Status" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript ES6+" />
  <img src="https://img.shields.io/badge/sem%20framework-zero%20deps-8b7355?style=flat-square" alt="Zero dependências" />
  <img src="https://img.shields.io/badge/frases-365-1a1a2e?style=flat-square" alt="365 frases" />
  <img src="https://img.shields.io/github/license/danhpaiva/DailyStoicView-html-css-js?style=flat-square" alt="Licença MIT" />
</p>

<p align="center">
  Uma Single Page Application minimalista que exibe uma frase estoica diferente para cada dia do ano —<br/>
  sem banco de dados, sem API, sem dependências.
</p>

<p align="center">
  <strong><a href="https://danhpaiva.github.io/DailyStoicView-html-css-js/">Ver online →</a></strong>
</p>

---

## Sobre o projeto

A seleção da frase é determinística: `(dayOfYear(date) - 1) % 365`. O mesmo dia do ano sempre exibe a mesma frase, em qualquer dispositivo, sem necessidade de backend.

As 365 frases estão em **português brasileiro** e são extraídas de obras primárias estoicas:

| Autor | Obra |
|---|---|
| Marco Aurélio | *Meditações* |
| Epicteto | *Encheirídion* |
| Epicteto | *Diatribes* |
| Sêneca | *Cartas a Lucílio* |
| Sêneca | *Sobre a Brevidade da Vida* |
| Sêneca | *Sobre a Vida Feliz* |
| Sêneca | *Hippolytus* |

## Funcionalidades

- **Frase do dia** — seleção determinística baseada no dia do ano
- **Navegação por data** — setas prev/next e seletor de calendário para explorar qualquer dia
- **Voltar para hoje** — botão contextual que aparece ao navegar para outra data
- **Frase aleatória** — botão "Surpreenda-me" que sorteia uma das 365 frases
- **Animação de virada de página** — transição 3D direcional ao trocar a frase
- **Modo foco** — expande o card para tela cheia, oculta header e footer
- **Favoritos** — salva frases no `localStorage` com aba dedicada
- **Exportar / Importar favoritos** — download e upload como `.json`
- **Compartilhar** — usa a Web Share API com fallback para clipboard
- **Streak de leitura** — contador de dias consecutivos com marcos em 7, 14, 21, 30, 60, 90, 180 e 365 dias
- **Tema claro / escuro** — detecção automática via `prefers-color-scheme` + alternância manual

## Estrutura

```
index.html                  → estrutura semântica (HTML5)
assets/
  css/
    style.css               → design tokens com variáveis CSS, tema claro/escuro, mobile-first
  js/
    quotes.js               → array com 365 frases em português brasileiro (dados puros)
    selector.js             → funções puras: dayOfYear(date), getQuote(date, quotes)
    app.js                  → DOM, eventos, localStorage (favoritos, streak, tema)
  icons/
    icon.svg                → ícone da aba do navegador (SVG)
.github/
  workflows/
    deploy.yml              → deploy automático no GitHub Pages via push para main
```

## Design

Inspirado em pergaminhos estoicos — tons de areia, âmbar e terracota. Tipografia serifada para leitura contemplativa.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--clr-bg` | `#f9f5ed` | `#0f0e0d` | Fundo da página |
| `--clr-surface` | `#fdfaf3` | `#1c1917` | Card da frase |
| `--clr-accent` | `#b45309` | `#f59e0b` | Botões, destaques |
| `--clr-text` | `#1c1917` | `#e7e5e4` | Texto principal |

Tipografia: **Crimson Pro** (serif) para a frase · **Inter** (sans-serif) para metadados e navegação.

## Como executar localmente

O projeto não tem build step. Qualquer servidor HTTP estático funciona.

```bash
# Com Node.js
npx serve .

# Com Python
python -m http.server 8000
```

> Não abra `index.html` diretamente pelo sistema de arquivos — os módulos ES6 exigem um servidor HTTP.

## Deploy

O deploy é automático via GitHub Actions. O workflow `.github/workflows/deploy.yml` é disparado a cada push na branch `main` e publica o projeto no GitHub Pages.

**Configuração necessária no repositório:**

1. Acesse **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**

## Testando a lógica de seleção

As funções em `selector.js` são puras e não têm dependências externas:

```js
import { dayOfYear, getQuote } from './assets/js/selector.js';
import { quotes } from './assets/js/quotes.js';

// Dia 1 do ano (1 de janeiro)
const jan1 = new Date(2026, 0, 1);
console.log(dayOfYear(jan1));        // 1
console.log(getQuote(jan1, quotes)); // quotes[0]

// Anos bissextos são tratados corretamente via Date.UTC
const feb29 = new Date(2024, 1, 29);
console.log(dayOfYear(feb29));       // 60
```

## Licença

[MIT](LICENSE)
