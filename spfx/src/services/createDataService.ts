import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IDataService } from './IDataService';
import { MockDataService } from './MockDataService';

/**
 * Chooses the data source. Demo data is used when explicitly requested (property pane toggle) or
 * when served from the local workbench, where there is no real site to query.
 * LiveDataService is loaded lazily so demo mode never pulls PnPjs into the initial bundle.
 */
export async function createDataService(context: BaseComponentContext, useDemoData: boolean): Promise<IDataService> {
  if (useDemoData || context.isServedFromLocalhost) {
    return new MockDataService();
  }
  const { LiveDataService } = await import(/* webpackChunkName: 'live-data-service' */ './LiveDataService');
  return new LiveDataService(context);
}
