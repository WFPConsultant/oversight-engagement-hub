import { IRecommendation } from '../models';
import { summarizeRecommendations } from './recommendationSummary';

const now = new Date(2026, 5, 15);
const rec = (o: Partial<IRecommendation>): IRecommendation => ({
  id: 1, ref: 'R', title: 't', engagementId: 1, engagementRef: 'E', priority: 'Medium', status: 'Open',
  owner: { displayName: 'o', email: 'o@x.invalid' }, targetDate: new Date(2026, 6, 1), ...o
});

describe('summarizeRecommendations', () => {
  it('counts overdue only for active items past their target date', () => {
    const s = summarizeRecommendations([
      rec({ targetDate: new Date(2026, 5, 1) }), // overdue, open
      rec({ targetDate: new Date(2026, 5, 15) }), // due today: not overdue
      rec({ status: 'In Progress', priority: 'High', targetDate: new Date(2026, 4, 1) }), // overdue, high
      rec({ status: 'Implemented', targetDate: new Date(2026, 4, 1) }) // finished: never overdue
    ], now);
    expect(s.overdue).toBe(2);
    expect(s.open).toBe(3);
    expect(s.highPriorityOpen).toBe(1);
    expect(s.overdueByPriority).toEqual({ High: 1, Medium: 1, Low: 0 });
  });

  it('computes implementation rate over accepted recommendations only', () => {
    const s = summarizeRecommendations([
      rec({ status: 'Implemented' }), rec({ status: 'Closed' }), rec({ status: 'Open' }), rec({ status: 'Not Accepted' })
    ], now);
    expect(s.implementationRate).toBe(67); // 2 of 3 accepted
  });

  it('handles an empty list without dividing by zero', () => {
    expect(summarizeRecommendations([], now).implementationRate).toBe(0);
  });
});
