import { IPageList, ISortingOptions } from "./portal";
import { IProductList, IProductListCard } from "./product";

import { IFacets } from "./facet";
import { ISEOModel } from "./category";
import { ISearchCMSPages } from "./keyword-search";

interface ICategory {
  categoryCode: string;
  name: string | undefined;
  seoDetails?: ISEOModel;
  publishCategoryId: number;
  subCategories: ICategory[];
  seoPageName?: string;
  childCategoryItems?: ICategory[];
}

export interface ISearchTerm {
  filteredProductData: IProductList;
  associatedCategoryList: ICategory[];
  filteredAttribute: IFacets[];
  enableCMSPageSearch?: boolean;
  searchCMSPagesData: ISearchCMSPages;
  isEnableCompare: boolean;
}

export interface ISearchResponse {
  associatedCategoryList?: ICategory[];
  associatedCategoryIds?: number[];
  suggestTerm?: string;
  facets?: IFacets[];
  paginationDetail: { pageIndex: number; pageSize: number; totalPages: number; totalResults: number };
  products: IProductListCard[];
  pageList?: IPageList[];
  sortList?: ISortingOptions[];
  hasError?: boolean;
  searchProfileId?: number;
}

export interface ISearchReportModel {
  StoreCode: string;
  UserId: number;
  UserProfileId?: number | undefined;
  SearchProfileId: number;
  ResultCount?: number;
  SearchKeyword?: string | undefined;
  TransformationKeyword?: string | undefined;
}
