export function formatINRFromLakhs(amountLakhs) {
  const n = Number(amountLakhs || 0)
  if (!Number.isFinite(n)) return '₹0'

  if (n >= 100) {
    const cr = n / 100
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 1)} Cr`
  }

  if (n >= 1) {
    return `₹${n.toFixed(n % 1 === 0 ? 0 : 1)} L`
  }

  return `₹${Math.round(n * 100)} K`
}
