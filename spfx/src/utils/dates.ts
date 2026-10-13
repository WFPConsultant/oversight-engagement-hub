const MS_PER_DAY = 86400000;

/** Start of the local calendar day. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d.getTime());
  r.setDate(r.getDate() + days);
  return r;
}

/** Whole days from `now` to `target` (negative when past). */
export function daysUntil(target: Date, now: Date = new Date()): number {
  return Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
}

/** Overdue = strictly before today (a due date of today is not overdue). Mirrors the CAML `<Lt>…<Today/>` views. */
export function isOverdue(target: Date, now: Date = new Date()): boolean {
  return daysUntil(target, now) < 0;
}
