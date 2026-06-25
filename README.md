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

A seleção da frase é determinística: `dayOfYear % 365`. O mesmo dia do ano sempre exibe a mesma frase, em qualquer dispositivo, sem necessidade de backend.

As 365 frases são extraídas de obras primárias estoicas:

| Autor | Obra |
|---|---|
| Marco Aurélio | *Meditações* |
| Epicteto | *Encheirídion* |
| Sêneca | *Cartas a Lucílio* |
| Epicteto de Hierápolis | *Diatribes* |

## Funcionalidades

- **Frase do dia** — seleção automática baseada no dia do ano
- **Preview de amanhã** — botão que mostra a frase do dia seguinte sem alterar a data real
- **Favoritos** — salva frases no `localStorage` com aba dedicada
- **Compartilhar** — usa a Web Share API com fallback para clipboard
- **Fade-in animado** no card ao carregar ou trocar de frase

## Estrutura

```
index.html                  → estrutura semântica (HTML5)
assets/
  css/
    style.css               → design tokens com variáveis CSS, mobile-first
  js/
    quotes.js               → array com 365 frases (dados puros, sem lógica)
    selector.js             → funções puras: dayOfYear(date), getQuote(date, quotes)
    app.js                  → manipulação de DOM, eventos, localStorage
.github/
  workflows/
    deploy.yml              → deploy automático no GitHub Pages via push para main
```

## Design

Inspirado em pergaminhos estoicos — tons de areia, mármore e chumbo romano.

| Token | Valor | Uso |
|---|---|---|
| `--color-lead` | `#1a1a2e` | Header, texto principal |
| `--color-bg` | `#f5f0e8` | Fundo da página |
| `--color-surface` | `#ede5d0` | Card da frase |
| `--color-accent` | `#8b7355` | Botões, destaques |

Tipografia: **Playfair Display** (serif) para a frase · **Inter** (sans-serif) para metadados.

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

As funções em `selector.js` são puras e não têm dependências externas, facilitando testes unitários:

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
