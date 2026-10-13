import { EngagementStatus, Priority, RecommendationStatus, RiskRating } from '../models';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const engagementStatusTone = (s: EngagementStatus): Tone =>
  ({ Planning: 'neutral', Fieldwork: 'info', Reporting: 'info', 'Follow-up': 'warning', Closed: 'success' } as Record<EngagementStatus, Tone>)[s];

export const recommendationStatusTone = (s: RecommendationStatus): Tone =>
  ({ Open: 'warning', 'In Progress': 'info', Implemented: 'success', Closed: 'success', 'Not Accepted': 'neutral' } as Record<RecommendationStatus, Tone>)[s];

export const riskTone = (r: RiskRating | Priority): Tone =>
  ({ High: 'danger', Medium: 'warning', Low: 'neutral' } as Record<string, Tone>)[r];
