import { quotes } from './quotes.js';
import { getQuote } from './selector.js';

// ── Theme ─────────────────────────────────────────────────────────────
const THEME_KEY = 'stoic_theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('btn-theme');
  if (btn) btn.querySelector('.theme-icon').textContent = theme === 'dark' ? '☽' : '☀︎';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved ?? getSystemTheme());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });
}

initTheme();

// ── State ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'stoic_favorites';

let currentDate   = new Date();
let isPreviewing  = false;

// ── DOM Refs ────────────────────────────────────────────────────────────
const elDateLabel   = document.getElementById('date-label');
const elQuoteText   = document.getElementById('quote-text');
const elQuoteAuthor = document.getElementById('quote-author');
const elQuoteWork   = document.getElementById('quote-work');
const elQuoteCard   = document.getElementById('quote-card');

const btnFavorite  = document.getElementById('btn-favorite');
const btnShare     = document.getElementById('btn-share');
const btnTomorrow  = document.getElementById('btn-tomorrow');
const elFeedback   = document.getElementById('share-feedback');

const btnToday     = document.getElementById('btn-today');
const btnFavorites = document.getElementById('btn-favorites');
const elFavCount   = document.getElementById('fav-count');

const secToday     = document.getElementById('section-today');
const secFavorites = document.getElementById('section-favorites');
const elFavList    = document.getElementById('favorites-list');
const elEmptyFavs  = document.getElementById('empty-favorites');

// ── Helpers ─────────────────────────────────────────────────────────────
function getFavorites() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function quoteId(quote) {
  return quote.text.slice(0, 40);
}

function isFavorited(quote) {
  return getFavorites().some(f => f.id === quoteId(quote));
}

function updateFavoriteButton(quote) {
  const faved = isFavorited(quote);
  btnFavorite.querySelector('.icon').textContent = faved ? '♥' : '♡';
  btnFavorite.querySelector('.btn-label').textContent = faved ? 'Favoritado' : 'Favoritar';
  btnFavorite.classList.toggle('favorited', faved);
  btnFavorite.setAttribute('aria-pressed', String(faved));
}

function updateFavCount() {
  const count = getFavorites().length;
  elFavCount.textContent = count > 0 ? String(count) : '';
}

// ── Render Quote ─────────────────────────────────────────────────────────
function renderQuote(date) {
  const quote = getQuote(date, quotes);
  const label = isPreviewing
    ? `Amanhã · ${formatDate(date)}`
    : formatDate(date);

  elDateLabel.textContent = label;
  elQuoteText.textContent = `"${quote.text}"`;
  elQuoteAuthor.textContent = quote.author;
  elQuoteWork.textContent = quote.work;

  // Restart animation
  elQuoteCard.style.animation = 'none';
  elQuoteCard.offsetHeight;        // reflow
  elQuoteCard.style.animation = '';

  updateFavoriteButton(quote);
}

// ── Render Favorites ─────────────────────────────────────────────────────
function renderFavorites() {
  const favs = getFavorites();
  elEmptyFavs.classList.toggle('hidden', favs.length > 0);
  elFavList.innerHTML = '';

  favs.forEach((fav, idx) => {
    const li = document.createElement('li');
    li.className = 'favorite-item';
    li.style.animationDelay = `${idx * 40}ms`;
    li.innerHTML = `
      <blockquote>"${fav.text}"</blockquote>
      <p class="fav-meta">${fav.author} · <em>${fav.work}</em></p>
      <div class="fav-actions">
        <button class="fav-remove-btn" data-id="${fav.id}" aria-label="Remover ${fav.author} dos favoritos">Remover</button>
      </div>`;
    elFavList.appendChild(li);
  });
}

// ── Event: Favorite ───────────────────────────────────────────────────────
btnFavorite.addEventListener('click', () => {
  const quote = getQuote(currentDate, quotes);
  const id    = quoteId(quote);
  let favs    = getFavorites();

  if (favs.some(f => f.id === id)) {
    favs = favs.filter(f => f.id !== id);
  } else {
    favs.push({ id, text: quote.text, author: quote.author, work: quote.work });
  }

  saveFavorites(favs);
  updateFavoriteButton(quote);
  updateFavCount();
});

// ── Event: Remove from favorites ──────────────────────────────────────────
elFavList.addEventListener('click', e => {
  const btn = e.target.closest('.fav-remove-btn');
  if (!btn) return;
  const id   = btn.dataset.id;
  const favs = getFavorites().filter(f => f.id !== id);
  saveFavorites(favs);
  renderFavorites();
  updateFavCount();
  updateFavoriteButton(getQuote(currentDate, quotes));
});

// ── Event: Share ─────────────────────────────────────────────────────────
btnShare.addEventListener('click', async () => {
  const quote = getQuote(currentDate, quotes);
  const text  = `"${quote.text}" — ${quote.author} (${quote.work})`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Daily Stoic View', text });
      showFeedback('Partilhado!');
    } catch (err) {
      if (err.name !== 'AbortError') copyFallback(text);
    }
  } else {
    copyFallback(text);
  }
});

function copyFallback(text) {
  navigator.clipboard.writeText(text)
    .then(() => showFeedback('Copiado para a área de transferência!'))
    .catch(()  => showFeedback('Não foi possível copiar.'));
}

let feedbackTimer;
function showFeedback(msg) {
  elFeedback.textContent = msg;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { elFeedback.textContent = ''; }, 2800);
}

// ── Event: Tomorrow preview ───────────────────────────────────────────────
btnTomorrow.addEventListener('click', () => {
  if (isPreviewing) {
    isPreviewing   = false;
    currentDate    = new Date();
    btnTomorrow.querySelector('.btn-label').textContent = 'Amanhã';
    btnTomorrow.querySelector('.icon').textContent = '→';
  } else {
    isPreviewing = true;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    currentDate = tomorrow;
    btnTomorrow.querySelector('.btn-label').textContent = 'Voltar';
    btnTomorrow.querySelector('.icon').textContent = '←';
  }
  renderQuote(currentDate);
});

// ── Event: Nav tabs ───────────────────────────────────────────────────────
btnToday.addEventListener('click', () => {
  secToday.classList.remove('hidden');
  secFavorites.classList.add('hidden');
  btnToday.classList.add('active');
  btnFavorites.classList.remove('active');
  btnToday.setAttribute('aria-pressed', 'true');
  btnFavorites.setAttribute('aria-pressed', 'false');
});

btnFavorites.addEventListener('click', () => {
  secFavorites.classList.remove('hidden');
  secToday.classList.add('hidden');
  btnFavorites.classList.add('active');
  btnToday.classList.remove('active');
  btnFavorites.setAttribute('aria-pressed', 'true');
  btnToday.setAttribute('aria-pressed', 'false');
  renderFavorites();
});

// ── Event: Theme toggle ───────────────────────────────────────────────────
document.getElementById('btn-theme').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ── Init ─────────────────────────────────────────────────────────────────
renderQuote(currentDate);
updateFavCount();
