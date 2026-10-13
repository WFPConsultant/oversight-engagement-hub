import { IEngagement } from '../models';
import { filterEngagements, sortEngagements } from './engagementList';

const mk = (o: Partial<IEngagement> & { ref: string }): IEngagement => ({
  id: 1, title: 'T', type: 'Audit', status: 'Fieldwork', riskRating: 'Medium',
  lead: { displayName: 'Lead', email: 'l@x.invalid' }, dueDate: new Date(2026, 6, 1), confidentiality: 'Confidential', ...o
});

describe('filterEngagements', () => {
  const items = [
    mk({ ref: 'A-1', title: 'Procurement review', status: 'Fieldwork' }),
    mk({ ref: 'A-2', title: 'Cash controls', status: 'Closed', lead: { displayName: 'Amara Okafor', email: 'a@x.invalid' } }),
    mk({ ref: 'A-3', title: 'Fleet', status: 'Planning' })
  ];

  it('hides closed engagements unless asked', () => {
    expect(filterEngagements(items, { text: '', status: 'all', showClosed: false }).map((e) => e.ref)).toEqual(['A-1', 'A-3']);
  });

  it('shows closed ones when explicitly filtering by Closed status', () => {
    expect(filterEngagements(items, { text: '', status: 'Closed', showClosed: false }).map((e) => e.ref)).toEqual(['A-2']);
  });

  it('searches across reference, title, type and lead, case-insensitively', () => {
    expect(filterEngagements(items, { text: 'amara', status: 'all', showClosed: true }).map((e) => e.ref)).toEqual(['A-2']);
    expect(filterEngagements(items, { text: 'PROCURE', status: 'all', showClosed: true }).map((e) => e.ref)).toEqual(['A-1']);
  });
});

describe('sortEngagements', () => {
  const a = mk({ ref: 'A', dueDate: new Date(2026, 6, 5), riskRating: 'Low', status: 'Closed' });
  const b = mk({ ref: 'B', dueDate: new Date(2026, 6, 1), riskRating: 'High', status: 'Planning' });

  it('sorts by due date ascending and descending', () => {
    expect(sortEngagements([a, b], 'dueDate', false).map((e) => e.ref)).toEqual(['B', 'A']);
    expect(sortEngagements([a, b], 'dueDate', true).map((e) => e.ref)).toEqual(['A', 'B']);
  });

  it('sorts risk High-first and status in workflow order, not alphabetically', () => {
    expect(sortEngagements([a, b], 'riskRating', false).map((e) => e.ref)).toEqual(['B', 'A']);
    expect(sortEngagements([a, b], 'status', false).map((e) => e.ref)).toEqual(['B', 'A']);
  });

  it('does not mutate its input', () => {
    const input = [a, b];
    sortEngagements(input, 'dueDate', false);
    expect(input[0]).toBe(a);
  });
});
