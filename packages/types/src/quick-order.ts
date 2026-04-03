/* eslint-disable @typescript-eslint/no-explicit-any*/

import { MutableRefObject } from "react";
import { IAttributesDetails } from "./product";

export interface IQuickOrder {
  productDetail: IQuickOrderProduct[];
  productSKUText: string;
  validSKUCount: number;
  invalidSKUCount: number | string;
  isSuccess: boolean;
  invalidSKUs: string[];
  invalidSKUsWithQuantity?: IInvalidSkuWithQuantity[];
  validSKUs: string[];
}

export interface IQuickOrderProduct {
  sku: string;
  maxQuantity: number;
  minQuantity: number;
  name: string;
  productType: string;
  quantityOnHand?: number;
  inputQuantity: number;
  isActive: boolean;
  isObsolete: string | boolean;
  isOutOfStock?: boolean;
  inventoryCode?: string;
  isPersonalizable?: string;
  isvalidSku: boolean;
  isAddOnRequired?: boolean;
  quantity?: number;
  callForPricingMessage?: string;
  publishProductId?: number;
  id?: number;
  hasExist?: boolean;
}

export interface IInvalidSkuWithQuantity {
  quantity: number;
  sku: string;
}

export interface IDynamicForm {
  defaultData?: Array<IDynamicFormDefault>;
  setDefaultData?: (_arg: Array<IDynamicFormDefault>) => void;
  getProductData?: (_arg: Array<IDynamicFormDefault>) => void;
  setSkuIdListForm?: (_arg: Array<IDynamicFormDefault>) => void;
  buttonText?: string;
  action?: "AddToCart" | "AddTemplate";
  buttonPosition?: "top" | "bottom";
  showAddNewField?: boolean;
  showFieldClearButton?: boolean;
  defaultRowCount?: number;
  showClearAllButton?: boolean;
  showHeading?: boolean;
  showMultipleItemsButton?: boolean;
  showFullWidthResult?: boolean;
  onButtonSubmit?: () => void;
}

export interface IAddCartJson {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  productType: string;
  parentProductId: number;
}
export interface IAddMultipleProductsToCartResponse {
  isSuccess: boolean;
  message: string;
  cartCount: number;
}

export interface IRules {
  max?: string | number;
  min?: string | number;
  alreadyExist?: boolean;
  cartItemQty?: number | null;
  productError: {
    type: string;
    validationMessage?: string;
  };
  duplicateWarning?: string;
}

export interface IDynamicFormDefault {
  sku: string;
  quantity: number;
  rules: IRules;
  formValue: ISelectedProduct;
}

export interface ISelectedProduct {
  sku: string;
  maxQuantity: string | number;
  minQuantity: string | number;
  name?: string;
  productType: string;
  quantity: number;
  quantityOnHand?: number;
  isActive: boolean;
  isObsolete: boolean;
  isvalidSku?: boolean;
  publishProductId?: number;
  isCallForPricing?: boolean;
  isAddOnRequired: boolean;
  isOutOfStock: boolean;
  callForPricingMessage: string;
  isDisablePurchasing?: boolean;
  hasPriceNotSet?: boolean;
  id?: number;
  parentProductId?: number;
  hasError?: boolean;
}

export interface IInvalidSkuWithQuantity {
  quantity: number;
  sku: string;
}

export interface IOrderDetails {
  sku?: string;
  quantity?: number;
  invalidEntry?: string;
}

export interface IQuickUploadDetails {
  sku?: string;
  inputQuantity?: number;
  isActive?: boolean;
  maxQuantity?: number;
  minQuantity?: number;
  isObsolete?: boolean;
  inventoryCode?: string;
  quantityOnHand?: number;
  formData?: string;
  invalidEntry?: string;
}

export interface IQuickOrderProps {
  setSkuIdList: React.Dispatch<React.SetStateAction<IDynamicFormDefault[]>>;
  skuIdList: IDynamicFormDefault[];
  skuIdListForm: IDynamicFormDefault[];
  ref?: MutableRefObject<null>;
}
export interface ILoader {
  uploadingFile: boolean;
  validatingFile: boolean;
}
export interface INewSkuObject {
  maxQuantity: number;
  minQuantity: number;
  isObsolete: boolean;
  inventoryCode: string;
  quantityOnHand: number;
}

export interface IQuickOrderCart {
  sku: string;
  quantity: number;
}

export interface IQuickOrderParameter {
  skus: string;
}

export interface IQuickOrderProductListResponse {
  products: IQuickOrderProduct[];
}

export interface ISearchProductResponse {
  products: ISearchProduct[];
  hasError?: boolean;
}

export interface ISearchProduct {
  categorySeoUrl?: string;
  name: string;
  seoUrl?: string;
  categoryId?: string;
  categoryName?: string;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  imageSmallThumbnailPath?: string;
  imageThumbNailPath?: string;
  imageSmallPath?: string;
  imageMediumPath?: string;
  catalogId: number;
  localeId: number;
  version: number;
  znodeProductId: number;
  id: number;
  sku: string;
  categoryIds?: string[];
  attributes?: IAttributesDetails[];
}
