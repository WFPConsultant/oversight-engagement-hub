import { isOverdue } from '../utils/dates';
import { MockDataService } from './MockDataService';

describe('MockDataService', () => {
  const now = new Date(2026, 5, 15);
  const service = new MockDataService(() => now, 0);

  it('returns engagements with resolved leads and dates relative to "now"', async () => {
    const engagements = await service.getEngagements();
    expect(engagements.length).toBeGreaterThan(5);
    for (const e of engagements) {
      expect(e.lead.displayName).not.toBe(e.lead.email); // lead resolved from users.json
      expect(e.dueDate).toBeInstanceOf(Date);
    }
  });

  it('is deterministic for a fixed clock', async () => {
    const a = await service.getEngagements();
    const b = await service.getEngagements();
    expect(a.map((e) => e.dueDate.getTime())).toEqual(b.map((e) => e.dueDate.getTime()));
  });

  it('contains both overdue and upcoming open recommendations so the demo is meaningful', async () => {
    const open = (await service.getRecommendations()).filter((r) => r.status === 'Open' || r.status === 'In Progress');
    expect(open.some((r) => isOverdue(r.targetDate, now))).toBe(true);
    expect(open.some((r) => !isOverdue(r.targetDate, now))).toBe(true);
  });

  it('links every recommendation to an existing engagement', async () => {
    const ids = new Set((await service.getEngagements()).map((e) => e.id));
    const recs = await service.getRecommendations();
    expect(recs.every((r) => ids.has(r.engagementId))).toBe(true);
  });

  it('returns tasks for the signed-in user', async () => {
    expect((await service.getMyTasks()).length).toBeGreaterThan(0);
  });
});
