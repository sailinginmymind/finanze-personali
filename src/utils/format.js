const numberFormatter = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatNumber(amount) {
  return numberFormatter.format(amount)
}

export function formatCurrency(amount) {
  return currencyFormatter.format(amount)
}

/**
 * Restituisce una versione mascherata del numero formattato,
 * sostituendo ogni cifra con '*' (mantiene punti, virgole e simbolo €).
 */
export function maskCurrency(amount) {
  const formatted = formatCurrency(amount)
  return formatted.replace(/\d/g, '*')
}

/**
 * Maschera un numero semplice (senza simbolo €)
 */
export function maskNumber(amount) {
  const formatted = formatNumber(amount)
  return formatted.replace(/\d/g, '*')
}