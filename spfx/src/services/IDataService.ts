import { IEngagement, IRecommendation, IUserTask } from '../models';

/**
 * The single seam between UI and data. Web parts depend on this interface only, so the
 * same components run against SharePoint/Graph (live) or sample data (demo).
 */
export interface IDataService {
  getEngagements(): Promise<IEngagement[]>;
  getRecommendations(): Promise<IRecommendation[]>;
  getMyTasks(): Promise<IUserTask[]>;
}
