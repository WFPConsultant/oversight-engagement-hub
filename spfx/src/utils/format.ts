/** Minimal {0}-style formatter for localized strings. */
export function format(template: string, ...args: Array<string | number>): string {
  return template.replace(/\{(\d+)\}/g, (m, i) => (args[Number(i)] !== undefined ? String(args[Number(i)]) : m));
}

/** Locale-aware short date, e.g. "15 Jun 2026" / "15 juin 2026". Falls back to ISO if the locale is invalid. */
export function formatDate(d: Date | undefined, locale: string): string {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
