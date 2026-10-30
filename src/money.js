// Money is stored as whole cents everywhere. Format only at the edges.

export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  const rest = String(abs % 100).padStart(2, '0');

  return `${sign}$${dollars}.${rest}`;
}
