import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from '@microsoft/sp-application-base';

import * as strings from 'ConfidentialityBannerApplicationCustomizerStrings';
import { Classification, ClassificationBanner, ClassificationFooter } from './components/ClassificationBanner';

const LOG_SOURCE = 'ConfidentialityBannerApplicationCustomizer';

/**
 * Set per site through the extension's ClientSideComponentProperties (JSON), e.g.
 * {"classification":"Strictly Confidential","policyUrl":"https://.../handling-policy"}.
 */
export interface IConfidentialityBannerProperties {
  classification?: Classification;
  /** Overrides the default localized message. */
  message?: string;
  policyUrl?: string;
}

const LABELS: Record<Classification, { label: string; message: string }> = {
  Internal: { label: strings.Classification_Internal, message: strings.DefaultMessage_Internal },
  Confidential: { label: strings.Classification_Confidential, message: strings.DefaultMessage_Confidential },
  'Strictly Confidential': { label: strings.Classification_StrictlyConfidential, message: strings.DefaultMessage_StrictlyConfidential }
};

export default class ConfidentialityBannerApplicationCustomizer extends BaseApplicationCustomizer<IConfidentialityBannerProperties> {
  private _top?: PlaceholderContent;
  private _bottom?: PlaceholderContent;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialised');
    // Placeholders may not exist yet on first load, and are recreated on SPA navigation.
    this.context.placeholderProvider.changedEvent.add(this, this._render);
    this._render();
    return Promise.resolve();
  }

  private _render = (): void => {
    const classification: Classification = this.properties.classification && LABELS[this.properties.classification]
      ? this.properties.classification
      : 'Confidential';
    const text = LABELS[classification];

    if (!this._top) {
      this._top = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });
    }
    if (this._top) {
      ReactDom.render(
        React.createElement(ClassificationBanner, {
          classification, label: text.label, message: this.properties.message || text.message, regionLabel: strings.BannerRegionLabel
        }),
        this._top.domElement
      );
    }

    if (!this._bottom) {
      this._bottom = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom, { onDispose: this._onDispose });
    }
    if (this._bottom) {
      ReactDom.render(
        React.createElement(ClassificationFooter, {
          text: strings.FooterText, policyUrl: this.properties.policyUrl, policyLinkText: strings.PolicyLinkText
        }),
        this._bottom.domElement
      );
    }
  };

  private _onDispose = (): void => {
    Log.info(LOG_SOURCE, 'Placeholder disposed');
  };

  public onDispose(): void {
    if (this._top) ReactDom.unmountComponentAtNode(this._top.domElement);
    if (this._bottom) ReactDom.unmountComponentAtNode(this._bottom.domElement);
  }
}
