import { ITheme } from '@fluentui/react';
import { IDataService } from '../../../services/IDataService';

export interface IMyTasksProps {
  service: IDataService;
  theme?: ITheme;
  title: string;
  maxItems: number;
  isDemo: boolean;
  locale: string;
  strings: IMyTasksWebPartStrings;
  now?: () => Date;
}
