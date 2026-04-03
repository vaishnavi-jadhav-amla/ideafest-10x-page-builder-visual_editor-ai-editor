export interface ICMSPages {
  seoTitle: string;
  seoDescription: string;
  seoUrl: string;
  pageTitle: string;
  contentPageId: number;
}

export interface ISearchCMSPages {
  cmsPages: ICMSPages[];
  totalCMSPageCount: number;
}
