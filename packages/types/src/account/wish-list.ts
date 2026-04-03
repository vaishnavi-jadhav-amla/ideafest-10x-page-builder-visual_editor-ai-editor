import { IAttributeDetails } from "../attribute";
import { IPageList } from "../portal";
import { IPublishBundleProductsDetails } from "../product-details";

export interface IWishlist {
  imageThumbNailPath?: string;
  publishProductId?: number;
  wishListId: number;
  name?: string;
  sku?: string;
  retailPrice?: number;
  salesPrice?: number;
  productType?: string;
  currencyCode?: string;
  price?: number;
  userWishListId?: number;
  attributes?: IAttributeDetails[];
  isObsolete: string;
  isOutOfStock: boolean;
  isPersonalizable?: boolean;
  quantity?: number;
  seoUrl: string;
  wishListAddedDate: string;
  isCallForPricing: boolean;
  addOns?: { isRequired: boolean }[];
  isAddonsRequired: boolean;
  publishBundleProducts?: IPublishBundleProductsDetails[];
}

export interface IWishlistResponse {
  wishList: IWishlist[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
  pageList: IPageList[];
}
export interface IWishListProduct {
  addOnProductSKUs?: string;
  portalId: number;
  id: number;
  sku: string;
  hasError?: boolean;
  errorCode?: number;
  wishListAddedDate: string;
}
export interface ICreateResponse {
  userName: string;
  sku: string;
  storeCode: string;
  addOnProductSku: string;
}
export interface ICreateWishlist {
  userName: string;
  sku: string;
  storeCode: string;
  addOnProductSku: string;
  wishListAddedDate?: Date;
  id?: number;
}
