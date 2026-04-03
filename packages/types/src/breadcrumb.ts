export interface IBreadCrumbsData {
  title: string;
  routingLabel: string;
  routingPath: string;
}

export interface IBreadCrumb {
  isParentCategory?: boolean;
  name?: string;
  znodeCategoryIds?: number[];
  customPath?: IBreadCrumbsData;
  combinationErrorMessage?: string;
  parentConfigurableProductName?: string;
  breadCrumbsTitle?: string;
  enablePageContextBreadcrumb?: boolean;
}

export interface IClientBreadCrumbsData extends IBreadCrumbsData {
  nestedRouting: boolean | string | undefined;
  nestedRoutingPath: string;
  nestedRoutingTitle: string;
  nestedRoutingLabel: string;
}

export interface IClientBreadCrumb {
  isParentCategory?: boolean;
  name?: string;
  znodeCategoryIds?: number[];
  customPath?: IClientBreadCrumbsData;
}
