declare interface IConfidentialityBannerApplicationCustomizerStrings {
  BannerRegionLabel: string;
  Classification_Internal: string;
  Classification_Confidential: string;
  Classification_StrictlyConfidential: string;
  DefaultMessage_Internal: string;
  DefaultMessage_Confidential: string;
  DefaultMessage_StrictlyConfidential: string;
  FooterText: string;
  PolicyLinkText: string;
}

declare module 'ConfidentialityBannerApplicationCustomizerStrings' {
  const strings: IConfidentialityBannerApplicationCustomizerStrings;
  export = strings;
}
