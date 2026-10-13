declare interface IRecommendationDashboardWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DataGroupName: string;
  TitleFieldLabel: string;
  DefaultTitle: string;
  ShowTablesLabel: string;
  TopOverdueCountLabel: string;
  UseDemoDataLabel: string;
  UseDemoDataOn: string;
  UseDemoDataOff: string;
  DemoBanner: string;
  Loading: string;
  ChartLoading: string;
  LoadError: string;
  Retry: string;
  CardsLabel: string;
  CardTotal: string;
  CardOpen: string;
  CardOpenHint: string;
  CardOverdue: string;
  CardOverdueHint: string;
  CardImplemented: string;
  CardImplementedHint: string;
  CardHighPriority: string;
  ChartByStatus: string;
  ChartOverdueByPriority: string;
  ShowAsTable: string;
  ColStatus: string;
  ColPriority: string;
  ColCount: string;
  TopOverdueTitle: string;
  ColRef: string;
  ColEngagement: string;
  ColOwner: string;
  ColTarget: string;
  ColDaysOverdue: string;
  NoOverdue: string;
  Status_Open: string;
  Status_InProgress: string;
  Status_Implemented: string;
  Status_Closed: string;
  Status_NotAccepted: string;
}

declare module 'RecommendationDashboardWebPartStrings' {
  const strings: IRecommendationDashboardWebPartStrings;
  export = strings;
}
