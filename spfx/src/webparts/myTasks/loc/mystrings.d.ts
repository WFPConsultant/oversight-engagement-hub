declare interface IMyTasksWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DataGroupName: string;
  TitleFieldLabel: string;
  DefaultTitle: string;
  MaxItemsLabel: string;
  UseDemoDataLabel: string;
  UseDemoDataOn: string;
  UseDemoDataOff: string;
  DemoBanner: string;
  Loading: string;
  LoadError: string;
  ConsentHint: string;
  Retry: string;
  GroupOverdue: string;
  GroupToday: string;
  GroupUpcoming: string;
  GroupNoDate: string;
  DueOn: string;
  InProgress: string;
  Empty: string;
  MoreHidden: string;
  SourceLabel: string;
}

declare module 'MyTasksWebPartStrings' {
  const strings: IMyTasksWebPartStrings;
  export = strings;
}
