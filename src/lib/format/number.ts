export function formatNumber(
  value: number,
  locale: string
) {
  return new Intl.NumberFormat(locale).format(value);
}
