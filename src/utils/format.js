const numberFormatter = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Restituisce il numero formattato con separatore delle migliaia e virgola decimale (es. 1.050,00)
 * @param {number} amount
 * @returns {string}
 */
export function formatNumber(amount) {
  return numberFormatter.format(amount);
}

/**
 * Restituisce il numero formattato come valuta (es. 1.050,00 €)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}