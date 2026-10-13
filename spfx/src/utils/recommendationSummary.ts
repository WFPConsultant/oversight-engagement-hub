import { IRecommendation, Priority, RecommendationStatus } from '../models';
import { isOverdue } from './dates';

export interface IRecommendationSummary {
  total: number;
  open: number;
  overdue: number;
  implemented: number;
  highPriorityOpen: number;
  /** Share of accepted recommendations that are implemented/closed, 0–100. */
  implementationRate: number;
  byStatus: Record<RecommendationStatus, number>;
  overdueByPriority: Record<Priority, number>;
}

export const isActive = (r: IRecommendation): boolean => r.status === 'Open' || r.status === 'In Progress';

export function summarizeRecommendations(recs: IRecommendation[], now: Date = new Date()): IRecommendationSummary {
  const byStatus: Record<RecommendationStatus, number> = { Open: 0, 'In Progress': 0, Implemented: 0, Closed: 0, 'Not Accepted': 0 };
  const overdueByPriority: Record<Priority, number> = { High: 0, Medium: 0, Low: 0 };
  let overdue = 0;
  let highPriorityOpen = 0;

  for (const r of recs) {
    byStatus[r.status]++;
    if (!isActive(r)) continue;
    if (r.priority === 'High') highPriorityOpen++;
    if (isOverdue(r.targetDate, now)) {
      overdue++;
      overdueByPriority[r.priority]++;
    }
  }
  const open = byStatus.Open + byStatus['In Progress'];
  const implemented = byStatus.Implemented + byStatus.Closed;
  const accepted = recs.length - byStatus['Not Accepted'];
  return {
    total: recs.length, open, overdue, implemented, highPriorityOpen,
    implementationRate: accepted === 0 ? 0 : Math.round((implemented / accepted) * 100),
    byStatus, overdueByPriority
  };
}
