import { ICartItemValidation } from "../cart";
import { IQuoteSearchByKey, IQuoteSort } from "./quote";

export interface ITemplateCartItems {
  totalPrice: number;
  itemPrice: number;
  minimumQuantity: number;
  maximumQuantity: number;
  cultureCode?: string;
  currencyCode: string;
  isActive?: boolean;
  isObsolete?: boolean;
  publishProductId?: number;
  productId: number;
  quantityValidationMessage?: string;
  allowBackOrder?: boolean;
  isDisablePurchasing?: boolean;
  isDontTrackInventory?: boolean;
  defaultInventoryCount?: string;
  isCallForPricing?: boolean;
  callForPricingMessage?: string;
  productType?: string;
  itemId: string;
  isExistingItem: boolean;
  showSku?: boolean;
  productLink?: string;
  quantity?: number;
  unitPrice?: number;
  extendedPrice: number;
  minQuantity?: number;
  maxQuantity?: number;
  productName: string;
  imagePath: string;
  cartDescription: string;
  sku: string;
  productDescription?: string;
  hasValidationErrors: boolean;
  productImageUrl?: string;
  cartItemId?: string;
  shippingCost?: number;
  orderLineItemState?: string;
}

export interface IAddToTemplateRequestModel {
  publishProductId: number;
  quantity: number;
  productSKU: string;
  itemId: string;
  isExistingItem: boolean;
  hasValidationErrors: boolean;
  imagePath?: string;
  totalPrice?: number;
  itemPrice?: number;
  unitPrice?: number;
  productName?: string;
}

export interface ICreateOrderTemplate {
  OrderTemplateName?: string | undefined;
  UserId: number;
  SkuDetails?: ISkuDetails[];
  OrderOrigin?: string | undefined;
  OrderTemplateNumber: string;
  CatalogCode?: string;
}

export interface ISkuDetails {
  Sku: string;
  Quantity: number;
  IsExistingItem: boolean;
}

export interface IOrderTemplateList {
  paginationDetail: IPaginationDetail;
  collectionDetails: IOrderTemplateCollectionDetails[] | undefined;
}

export interface IOrderTemplateCollectionDetails {
  quantity: number;
  createdDate: string;
  modifiedDate: string;
  className: string;
  classNumber: string;
  cultureCode?: string;
}

export interface IPaginationDetail {
  totalResults: number;
}

export interface IOrderTemplateListModel {
  classType: string;
  pageSize: number;
  pageIndex: number;
  sortValue: IQuoteSort;
  currentFilters: IQuoteSearchByKey[];
}

export interface ICreateTemplateResponse {
  status: boolean;
  isTemplateModified?: boolean;
}

export interface IOrderTemplate {
  itemList?: ITemplateCartItems[] | undefined;
  className?: string | undefined;
}

export interface IUpdateClassItemQuantity {
  Sku: string;
  Quantity: number;
  ItemId?: string | undefined;
}

export interface IBulkQuantity {
  classType: string;
  classNumber: string;
  updateClassItemQuantity: IUpdateClassItemQuantity[] | undefined;
}

export interface IUpdateBulkItemQuantityResponse {
  isSuccess?: boolean;
  validationDetails?: ICartItemValidation[] | undefined;
}
