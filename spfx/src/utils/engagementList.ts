import { EngagementStatus, IEngagement, RiskRating } from '../models';

export type EngagementSortKey = 'ref' | 'title' | 'type' | 'status' | 'lead' | 'dueDate' | 'riskRating';

export interface IEngagementFilter {
  text: string;
  status: EngagementStatus | 'all';
  showClosed: boolean;
}

const STATUS_ORDER: EngagementStatus[] = ['Planning', 'Fieldwork', 'Reporting', 'Follow-up', 'Closed'];
const RISK_ORDER: RiskRating[] = ['High', 'Medium', 'Low'];

export function filterEngagements(items: IEngagement[], filter: IEngagementFilter): IEngagement[] {
  const needle = filter.text.trim().toLowerCase();
  return items.filter((e) => {
    if (!filter.showClosed && e.status === 'Closed' && filter.status !== 'Closed') return false;
    if (filter.status !== 'all' && e.status !== filter.status) return false;
    if (!needle) return true;
    return [e.ref, e.title, e.type, e.lead.displayName].some((v) => v.toLowerCase().indexOf(needle) !== -1);
  });
}

function compare(a: IEngagement, b: IEngagement, key: EngagementSortKey): number {
  switch (key) {
    case 'dueDate': return a.dueDate.getTime() - b.dueDate.getTime();
    case 'status': return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    case 'riskRating': return RISK_ORDER.indexOf(a.riskRating) - RISK_ORDER.indexOf(b.riskRating);
    case 'lead': return a.lead.displayName.localeCompare(b.lead.displayName);
    default: return a[key].localeCompare(b[key]);
  }
}

/** Stable sort; ties fall back to the reference so ordering is deterministic. */
export function sortEngagements(items: IEngagement[], key: EngagementSortKey, descending: boolean): IEngagement[] {
  const dir = descending ? -1 : 1;
  return items.slice().sort((a, b) => compare(a, b, key) * dir || a.ref.localeCompare(b.ref));
}
