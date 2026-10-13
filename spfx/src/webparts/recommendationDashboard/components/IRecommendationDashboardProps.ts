import { ITheme } from '@fluentui/react';
import { IDataService } from '../../../services/IDataService';

export interface IRecommendationDashboardProps {
  service: IDataService;
  theme?: ITheme;
  title: string;
  showTables: boolean;
  topOverdueCount: number;
  isDemo: boolean;
  locale: string;
  strings: IRecommendationDashboardWebPartStrings;
  /** Injectable clock for tests. */
  now?: () => Date;
}
