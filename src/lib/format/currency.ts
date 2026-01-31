export function formatCurrency(
  amount: number | string,
  currency: string,
  locale: string
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 3, // KWD uses 3 decimals
  }).format(Number(amount));
}
