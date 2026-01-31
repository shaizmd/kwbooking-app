const KUWAIT_TIMEZONE = "Asia/Kuwait";

export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: KUWAIT_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: string
) {
  const startDate = formatDate(start, locale);
  const endDate = formatDate(end, locale);
  return `${startDate} – ${endDate}`;
}
