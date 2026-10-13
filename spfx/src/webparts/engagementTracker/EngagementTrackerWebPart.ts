import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration, PropertyPaneSlider, PropertyPaneTextField, PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ITheme } from '@fluentui/react';

import * as strings from 'EngagementTrackerWebPartStrings';
import EngagementTracker from './components/EngagementTracker';
import { IEngagementTrackerProps } from './components/IEngagementTrackerProps';
import { IDataService } from '../../services/IDataService';
import { createDataService } from '../../services/createDataService';
import { toFluentTheme } from '../../utils/theme';

export interface IEngagementTrackerWebPartProps {
  title: string;
  showClosed: boolean;
  dueSoonDays: number;
  useDemoData: boolean;
}

export default class EngagementTrackerWebPart extends BaseClientSideWebPart<IEngagementTrackerWebPartProps> {
  private _service?: IDataService;
  private _serviceKey?: boolean;
  private _theme?: ITheme;

  protected async onInit(): Promise<void> {
    await this._ensureService();
  }

  private async _ensureService(): Promise<void> {
    if (this._service && this._serviceKey === this.properties.useDemoData) return;
    this._serviceKey = this.properties.useDemoData;
    this._service = await createDataService(this.context, !!this.properties.useDemoData);
  }

  public render(): void {
    if (!this._service) return;
    const element = React.createElement<IEngagementTrackerProps>(EngagementTracker, {
      service: this._service,
      theme: this._theme,
      title: this.properties.title || strings.DefaultTitle,
      showClosed: !!this.properties.showClosed,
      dueSoonDays: this.properties.dueSoonDays ?? 14,
      isDemo: !!this.properties.useDemoData || this.context.isServedFromLocalhost,
      locale: this.context.pageContext.cultureInfo.currentUICultureName || 'en-US',
      strings
    });
    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this._theme = toFluentTheme(currentTheme);
    this.render();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    if (propertyPath === 'useDemoData') {
      this._ensureService().then(() => this.render()).catch(() => undefined);
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [
          {
            groupName: strings.BasicGroupName,
            groupFields: [
              PropertyPaneTextField('title', { label: strings.TitleFieldLabel }),
              PropertyPaneToggle('showClosed', { label: strings.ShowClosedLabel }),
              PropertyPaneSlider('dueSoonDays', { label: strings.DueSoonDaysLabel, min: 1, max: 60, step: 1, showValue: true })
            ]
          },
          {
            groupName: strings.DataGroupName,
            groupFields: [
              PropertyPaneToggle('useDemoData', {
                label: strings.UseDemoDataLabel, onText: strings.UseDemoDataOn, offText: strings.UseDemoDataOff
              })
            ]
          }
        ]
      }]
    };
  }
}
