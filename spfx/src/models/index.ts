export type EngagementType = 'Audit' | 'Inspection' | 'Advisory' | 'Investigation';
export type EngagementStatus = 'Planning' | 'Fieldwork' | 'Reporting' | 'Follow-up' | 'Closed';
export type RiskRating = 'Low' | 'Medium' | 'High';
export type Confidentiality = 'Internal' | 'Confidential' | 'Strictly Confidential';
export type RecommendationStatus = 'Open' | 'In Progress' | 'Implemented' | 'Closed' | 'Not Accepted';
export type Priority = 'High' | 'Medium' | 'Low';

export interface IPerson {
  displayName: string;
  email: string;
}

export interface IEngagement {
  id: number;
  ref: string;
  title: string;
  type: EngagementType;
  status: EngagementStatus;
  riskRating: RiskRating;
  lead: IPerson;
  startDate?: Date;
  dueDate: Date;
  budgetDays?: number;
  confidentiality: Confidentiality;
  /** Link to the list item (live mode only). */
  url?: string;
}

export interface IRecommendation {
  id: number;
  ref: string;
  title: string;
  engagementId: number;
  engagementRef: string;
  priority: Priority;
  status: RecommendationStatus;
  owner: IPerson;
  targetDate: Date;
  implementedDate?: Date;
  managementResponse?: string;
  url?: string;
}

export type TaskSource = 'Planner' | 'To Do' | 'SharePoint';

export interface IUserTask {
  id: string;
  title: string;
  source: TaskSource;
  status: 'notStarted' | 'inProgress';
  dueDate?: Date;
  webUrl?: string;
  engagementRef?: string;
}
