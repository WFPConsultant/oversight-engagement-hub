import { ITheme } from '@fluentui/react';
import { IDataService } from '../../../services/IDataService';

export interface IEngagementTrackerProps {
  service: IDataService;
  theme?: ITheme;
  title: string;
  showClosed: boolean;
  dueSoonDays: number;
  isDemo: boolean;
  /** BCP-47 tag used for date formatting, taken from the page's UI culture. */
  locale: string;
  strings: IEngagementTrackerWebPartStrings;
}
