import { Dispatch, SetStateAction } from "react";
import { IAttributeDetails, IBaseAttribute } from "./attribute";

import { ISeoDetails } from "./seo";

export interface ICategoryResponse {
  catalogId: number | null;
  categoryCode: string | null;
  attributes: IBaseAttribute[];
  categoryName: string | null;
}

export interface ICategory {
  categoryCode: string;
  name: string | undefined;
  seoDetails?: ISEOModel;
  publishCategoryId: number;
  subCategories: ICategory[];
  seoPageName?: string;
  childCategoryItems?: ICategory[];
  seoUrl?: string;
  hasSubCategories?: boolean;
}

export interface ISEOModel {
  seoDescription?: string;
  seoKeywords?: string;
  seoTitle?: string;
  seoPageName?: string;
  seoUrl?: string;
}

export interface IChildCategoryItemsData {
  name: string;
  publishCategoryId: number;
  hasSubCategories: boolean;
  categoryUrl: string;
  dataTestSelector: string;
  breadcrumbHtml: string;
}

export interface ICategoryProps {
  type?: string;
  setShowNavBar?: Dispatch<SetStateAction<boolean>>;
}

export interface ISubCategoryItemsData {
  seoPageName?: string;
  name: string;
  publishCategoryId: number;
  subCategories?: IChildCategoryItemsData[];
  childCategoryItems?: ISubCategoryItemsData[];
  seoDetails?: ISeoInformation;
  hasSubCategories: boolean;
  categoryUrl: string;
  dataTestSelector: string;
  breadcrumbHtml: string;
}
export interface IAttributesValues {
  attributeCode: string;
  attributeValues: string;
}

export interface ISeoInformation {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoPageName?: string;
  seoUrl?: string;
}

export interface ICategoryDetails {
  categories: IMegaMenuCategory[];
  isUserLoggedIn: boolean;
  isEnableQuoteRequest: boolean;
}

export interface IMegaMenuCategory {
  name: string;
  publishCategoryId: number;
  subCategories?: ISubCategoryItemsData[];
  categoryCode?: string;
  imageMediumPath?: string;
  imageSmallPath?: string;
  attributes?: IAttributesValues[];
  seoDetails?: ISeoInformation;
  mobResponsive?: boolean;
  hasSubCategories?: boolean;
  categoryUrl: string;
  dataTestSelector: string;
  breadcrumbHtml: string;
}

export interface ISubCategoryData {
  name?: string;
  publishCategoryId?: number;
  subCategories?: ISubCategoryItemsData[];
  mobResponsive?: boolean;
  setIsMenuShown: (_arg1: boolean) => void;
  isFetching: boolean;
  parentCategoryData?: IMegaMenuCategory | null;
}

export interface IFeatureCategoriesRoot {
  status: string;
  message: string;
  data: IFeatureCategoriesData[];
}

export interface IFeatureCategoriesData {
  id: string;
  name: string;
  publishCategoryId: number;
  imageSmallPath: string;
  categoryCode: string;
  seoUrl: string;
  categoryId: number;
}

export interface IPublishCategory {
  name: string;
  publishCategoryId?: number;
  attributes?: IAttributeDetails[];
  catalogName?: string;
  categoryCode?: string;
  seoDetails?: ISeoDetails;
  parentCategory?: IPublishCategory[];
}

export interface ICategory {
  categoryUrl?: string;
  categoryName: string;
  imageSmallPath: string;
  categoryCode: string;
  seoDetails?: ISEOModel;
}

export interface ISubcategoryResponse {
  categories: ISubCategoryItemsData[];
  isUserLoggedIn?: boolean;
}
