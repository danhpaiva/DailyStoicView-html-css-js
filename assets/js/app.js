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

// ── Streak ────────────────────────────────────────────────────────────
const STREAK_KEY = 'stoic_streak';

function toDateStr(date) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || {}; }
  catch { return {}; }
}

function updateStreak() {
  const todayStr     = toDateStr(new Date());
  const data         = loadStreak();

  if (data.lastVisit === todayStr) return data.streak ?? 1;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  const streak = data.lastVisit === yesterdayStr ? (data.streak ?? 0) + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ lastVisit: todayStr, streak }));
  return streak;
}

function renderStreak(streak) {
  const wrap = document.getElementById('streak-wrap');
  if (!wrap) return;

  const milestones  = [7, 14, 21, 30, 60, 90, 180, 365];
  const isMilestone = milestones.includes(streak);

  const flame = streak >= 7 ? '🔥' : '✦';
  const label = streak === 1
    ? '1 dia seguido'
    : `${streak} dias seguidos`;

  const pill = document.createElement('div');
  pill.className = `streak-pill${isMilestone ? ' milestone' : ''}`;
  pill.setAttribute('title', streakTooltip(streak, isMilestone));
  pill.innerHTML = `<span class="streak-flame" aria-hidden="true">${flame}</span>${label}`;

  wrap.innerHTML = '';
  wrap.appendChild(pill);
}

function streakTooltip(streak, isMilestone) {
  if (isMilestone) return `🏆 Marco alcançado! ${streak} dias seguidos.`;
  const next = [7, 14, 21, 30, 60, 90, 180, 365].find(m => m > streak) ?? 365;
  return `Faltam ${next - streak} dia${next - streak !== 1 ? 's' : ''} para o próximo marco (${next} dias).`;
}

// ── State ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'stoic_favorites';

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

let currentDate   = today();
let randomQuote   = null;   // non-null when showing a random quote

// ── DOM Refs ────────────────────────────────────────────────────────────
const elDateLabel    = document.getElementById('date-label');
const elDatePicker   = document.getElementById('date-picker');
const btnPrevDay     = document.getElementById('btn-prev-day');
const btnNextDay     = document.getElementById('btn-next-day');
const btnBackToday   = document.getElementById('btn-back-today');

const elQuoteText    = document.getElementById('quote-text');
const elQuoteAuthor  = document.getElementById('quote-author');
const elQuoteWork    = document.getElementById('quote-work');
const elQuoteCard    = document.getElementById('quote-card');

const btnFavorite    = document.getElementById('btn-favorite');
const btnShare       = document.getElementById('btn-share');
const btnRandom      = document.getElementById('btn-random');
const elFeedback     = document.getElementById('share-feedback');

const btnToday       = document.getElementById('btn-today');
const btnFavorites   = document.getElementById('btn-favorites');
const elFavCount     = document.getElementById('fav-count');

const secToday       = document.getElementById('section-today');
const secFavorites   = document.getElementById('section-favorites');
const elFavList      = document.getElementById('favorites-list');
const elEmptyFavs    = document.getElementById('empty-favorites');

// ── Helpers ─────────────────────────────────────────────────────────────
function getFavorites() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// "2026-06-24" — format required by <input type="date">
function toInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isToday(date) {
  const t = today();
  return date.getFullYear() === t.getFullYear() &&
         date.getMonth()    === t.getMonth()    &&
         date.getDate()     === t.getDate();
}

// Returns whichever quote is currently displayed
function activeQuote() { return randomQuote ?? getQuote(currentDate, quotes); }

function quoteId(quote) { return quote.text.slice(0, 40); }

function isFavorited(quote) {
  return getFavorites().some(f => f.id === quoteId(quote));
}

function updateFavoriteButton(quote = activeQuote()) {
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
  randomQuote = null;
  const quote = getQuote(date, quotes);

  elDateLabel.textContent = formatDate(date);
  elDatePicker.value      = toInputValue(date);
  elQuoteText.textContent = `"${quote.text}"`;
  elQuoteAuthor.textContent = quote.author;
  elQuoteWork.textContent   = quote.work;

  // Restart card animation
  elQuoteCard.style.animation = 'none';
  elQuoteCard.offsetHeight;
  elQuoteCard.style.animation = '';

  // Show/hide "back to today"
  btnBackToday.classList.toggle('visible', !isToday(date));

  updateFavoriteButton(quote);
}

// ── Navigate to date ──────────────────────────────────────────────────────
function navigateTo(date) {
  currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);
  renderQuote(currentDate);
}

function shiftDay(delta) {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + delta);
  navigateTo(d);
}

// ── Event: Prev / Next day ────────────────────────────────────────────────
btnPrevDay.addEventListener('click', () => shiftDay(-1));
btnNextDay.addEventListener('click', () => shiftDay(+1));

// ── Event: Click date label → open date picker ────────────────────────────
elDateLabel.addEventListener('click', () => elDatePicker.showPicker?.() ?? elDatePicker.click());

elDatePicker.addEventListener('change', () => {
  if (!elDatePicker.value) return;
  const [y, m, d] = elDatePicker.value.split('-').map(Number);
  navigateTo(new Date(y, m - 1, d));
});

// ── Event: Back to today ──────────────────────────────────────────────────
btnBackToday.addEventListener('click', () => navigateTo(today()));

// ── Keyboard: arrow keys on date nav area ────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft')  shiftDay(-1);
  if (e.key === 'ArrowRight') shiftDay(+1);
});

// ── Event: Random quote ───────────────────────────────────────────────────
btnRandom.addEventListener('click', () => {
  const current = activeQuote();
  let pick;
  do { pick = quotes[Math.floor(Math.random() * quotes.length)]; }
  while (quotes.length > 1 && pick === current);

  randomQuote = pick;

  elDateLabel.textContent   = '✦ Frase aleatória';
  elQuoteText.textContent   = `"${pick.text}"`;
  elQuoteAuthor.textContent = pick.author;
  elQuoteWork.textContent   = pick.work;

  elQuoteCard.style.animation = 'none';
  elQuoteCard.offsetHeight;
  elQuoteCard.style.animation = '';

  updateFavoriteButton(pick);
  btnBackToday.classList.add('visible');
});

// ── Event: Favorite ───────────────────────────────────────────────────────
btnFavorite.addEventListener('click', () => {
  const quote = activeQuote();
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
  const favs = getFavorites().filter(f => f.id !== btn.dataset.id);
  saveFavorites(favs);
  renderFavorites();
  updateFavCount();
  updateFavoriteButton();
});

// ── Event: Share ─────────────────────────────────────────────────────────
btnShare.addEventListener('click', async () => {
  const quote = activeQuote();
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
        <button class="fav-remove-btn" data-id="${fav.id}"
          aria-label="Remover dos favoritos">Remover</button>
      </div>`;
    elFavList.appendChild(li);
  });
}

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
renderStreak(updateStreak());
