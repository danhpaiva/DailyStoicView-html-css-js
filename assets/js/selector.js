/**
 * selector.js — lógica pura, sem efeitos colaterais, testável isoladamente.
 */

/**
 * Retorna o número do dia no ano (1-based) para uma data.
 * Trata anos bissextos corretamente via UTC para evitar DST.
 * @param {Date} date
 * @returns {number} 1..366
 */
export function dayOfYear(date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now   = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const MS_PER_DAY = 86_400_000;
  return Math.floor((now - start) / MS_PER_DAY);
}

/**
 * Retorna a frase do array quotes correspondente ao dia da data.
 * @param {Date}   date
 * @param {Array}  quotes  — array com 365 objetos
 * @returns {object} { text, author, work }
 */
export function getQuote(date, quotes) {
  const index = (dayOfYear(date) - 1) % quotes.length;
  return quotes[index];
}
