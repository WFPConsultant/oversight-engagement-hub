import { addDays, daysUntil, isOverdue } from './dates';

describe('dates', () => {
  const now = new Date(2026, 5, 15, 14, 30); // 15 Jun 2026, afternoon

  it('treats today as not overdue', () => {
    expect(isOverdue(new Date(2026, 5, 15, 0, 0), now)).toBe(false);
  });

  it('treats yesterday as overdue', () => {
    expect(isOverdue(addDays(now, -1), now)).toBe(true);
  });

  it('counts whole days regardless of time of day', () => {
    expect(daysUntil(new Date(2026, 5, 18, 23, 59), now)).toBe(3);
    expect(daysUntil(new Date(2026, 5, 12, 0, 1), now)).toBe(-3);
  });
});
