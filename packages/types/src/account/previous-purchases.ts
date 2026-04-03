import { Dispatch, SetStateAction } from "react";

import { IPageList } from "../portal";

interface IValidationDetails {
  code?: number;
  message?: string;
  priority?: number;
  sku?: string;
}
export interface IAddOnSku {
  sku: string;
  productName: string;
  groupName: string;
  unitPrice: number | null;
  validationDetails: IValidationDetails | null;
}

export interface IPersonalization {
  personalizedId: string;
  value: string;
  code: string;
}

export interface IPurchaseItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  productImageUrl: string;
  productDescription: string;
  sku: string;
  quantity?: number;
  maxQty?: number;
  minQty?: number;
  orderDate: string;
  availability: string;
  lastOrderedQty: number;
  unitPricePurchased: number;
  unitPrice: number;
  currencyCode: string;
  reorder?: number;
  isInValid: boolean;
  isChildProduct: boolean;
  attributes?: IAttributeDetails[];
  personalizedDetails: IPersonalization[];
  addOnSkuList: IAddOnSku[];
  productType: string;
  parentProductId: string;
  parentProductType: string;
  parentSku: string;
  inventoryMessage: string;
  behaviorMsg?: string;
}

export interface IUsePreviousPurchasesReturn {
  items: IPurchaseItem[];
  loading: boolean;
  totalResults: number;
  pageList: IPageList[];
  isAddToCartLoading: string | null;
  column: string;
  selected: string[];
  onColumnSort: (_headerKey: string, _column: string, _order: string) => void;
  onPageSizeChange: (_pageSize: number) => Promise<void>;
  onPageIndexChange: (_pageIndex: number) => Promise<void>;
  selectAll: () => void;
  handledMoveAllProductToCart: () => void;
  selectSingleProduct: (_id: string, _sku: string) => void;
  clearSelection: () => void;
  handleSearch: (_text: string) => void;
  toggleSelect: (_id: string) => void;
  handleFilterDayChange: (_text: string) => void;
  handleQtyChange: (_productId: string, _value: string, _maxQty: number, _minQty: number) => Promise<void>;
  handleAddToCart: () => Promise<void>;
  handleSingleAddToCart: (_productId: string) => Promise<void>;
  setQtyMap: Dispatch<SetStateAction<Record<string, string | number>>>;
  setValidationMessages: Dispatch<SetStateAction<Record<string, string>>>;
  setInvalidInventory: Dispatch<SetStateAction<Record<string, { sku: string; isInValid: boolean }>>>;
  setStockMessage: Dispatch<SetStateAction<Record<string, { message: string; isInValid: boolean }>>>;
  setItems: Dispatch<SetStateAction<IPurchaseItem[]>>;
  qtyMap: Record<string, string | number>;
  invalidInventory: Record<string, { sku: string; isInValid: boolean }>;
  validationMessages: Record<string, string>;
  stockMessage: Record<string, { message: string; isInValid: boolean }>;
  dateDetails: { dateFormat?: string; timeFormat?: string; displayTimeZone?: string; priceRoundOff?: number };
  productDetails: Record<string, IPurchaseItem>;
}

export interface IPaginationDetails {
  PageIndex: number;
  PageSize: number;
  TotalPages: number;
  TotalResults: number;
}

export interface IPreviousPurchasesList {
  productId: string;
  productName: string;
  productImageUrl: string;
  productDescription: string;
  sku: string;
  quantity?: number;
  minQty?: number;
  maxQty?: number;
  orderDate: string;
  lastOrderedQty: number;
  unitPricePurchased: number;
  unitPrice: number;
  currencyCode: string;
  reorder?: number;
  isInValid: boolean;
  attributes?: IAttributeDetails[];
  personalizedDetails: IPersonalization[];
  addOnSkuList: IAddOnSku[];
  productType: string;
  parentProductId: string;
  parentProductType: string;
  parentSku: string;
  isChildProduct: boolean;
}

export interface IResponsePreviousPurchases {
  orders: IPreviousPurchasesList[];
  pageIndex: number;
  pageSize: number;
  pageList: IPageList[];
  totalResults: number;
  totalPages: number;
  dateFormat?: string;
  timeFormat?: string;
  displayTimeZone?: string;
  priceRoundOff?: number;
}
//  for api response

interface IValidationDetails {
  code?: number;
  message?: string;
  priority?: number;
  sku?: string;
}

interface ISelectValue {
  value: string;
  code: string;
  swatchText: string;
  path: string;
  displayOrder?: number;
  variantDisplayOrder?: number;
  variantImagePath?: string;
  variantSKU?: string;
  actionMode?: string;
}

interface IAttributeDetails {
  attributeValue: string;
  attributeCode: string;
  selectValues: ISelectValue[] | null;
  isConfigurable: boolean;
  attributeDefaultValueCode: string | null;
  orderProductId: string | null;
  attributeName: string;
}

export interface IChildItem {
  lineItemId: string;
  sku: string;
  productName: string;
  productDescription: string | null;
  quantity: number;
  unitPrice: number;
  addOnSkuList: IAddOnSku[];
  personalizedDetails: IPersonalization[];
  attributeDetails: IAttributeDetails[];
  validationDetails: IValidationDetails | null;
  productType: string;
  itemPrice: number;
  productImagePath: string | null;
  orderDate: string;
}

export interface IOrderPurchaseItem {
  lineItemId: string;
  productName: string;
  productDescription: string | null;
  personalizedDetails: IPersonalization[];
  quantity: number;
  unitPrice: number;
  addOnSkuList: IAddOnSku[];
  sku: string;
  previousPurchaseChildItemList: IChildItem[] | null;
  attributeDetails: IAttributeDetails[];
  validationDetails: IValidationDetails | null;
  productImagePath: string | null;
  productType: string | null;
  itemPrice: number;
  orderDate: string;
  classNumber: string;
}
export interface IValidationInventoryBody {
  sku: string;
  inventoryFlag?: boolean;
  productId?: string;
  quantity: number;
  addOnSkuList?: IAddOnSku[];
  personalizedDetails?: IPersonalization[];
}

export interface IAddToCartItems {
  lineItemId: string;
  quantity: number | null;
  groupCode?: string;
}

export interface IAddToCartRequestBody {
  customerId: number;
  catalogCode: string;
  origin: string;
  lineItemDetails: IAddToCartItems[];
}

export interface IAddToCartPreviousPurchasesResponse {
  [key: string]: {
    isSuccess: boolean;
    message: string;
    itemId: string;
    priority?: string;
  };
}

export interface IAddToCartPreviousPurchases {
  copiedLineItemList: {
    itemId: string;
    validationDetails: {
      validationMessage: string;
      validationCode: string;
      priority: number;
    }[];
  }[];
}

export interface IAddToCartApiResponse {
  isSuccess: boolean;
  validation: IAddToCartPreviousPurchasesResponse | null;
}

export interface InventoryValidationDetail {
  validationCode: string;
  validationMessages: InventoryMessages[];
  sku: string;
  priority: number;
  inStockQuantity: number;
  backOrderQuantity: number;
}

export interface InventoryStatus {
  sku: string;
  message: string;
  isInStock?: boolean;
  isOutOfStock?: boolean;
  isBackOrder?: boolean;
  qty: number;
}

export interface InventoryMessages {
  [key: string]: string;
}

export interface IDateRangeProps {
  handleFilterDayChange: (_text: string) => void;
  calenderShow: number;
  isMobileScreen: boolean;
  dateFormat?: string;
  timeFormat?: string;
  displayTimeZone?: string;
  rangeSeparator?: string;
}

export interface IHeaderProps {
  moveAllProductToCart: () => void;
  handleAddToCart: () => void;
  handleSearch: (_text: string) => void;
  handleFilterDayChange: (_text: string) => void;
  dateDetails: { dateFormat?: string; timeFormat?: string; displayTimeZone?: string };
}

export interface IInventoryCheckProps {
  productId: string;
  sku: string;
  qty: number;
  addOnList: IAddOnSku[];
  setValidationMessages: Dispatch<SetStateAction<Record<string, string>>>;
  setInvalidInventory: (_productId: string, _status: boolean, _message: string) => void;
}

export interface IPurchaseProduct {
  productId: string;
  productName: string;
  productImageUrl: string;
  productDescription: string;
  sku: string;
  quantity?: number;
  minQty?: number;
  maxQty?: number;
  orderDate: string;
  availability: string;
  lastOrderedQty: number;
  unitPricePurchased: number;
  unitPrice: number;
  currencyCode: string;
  reorder?: number;
  isInValid: boolean;
  validationMessage?: string;
}

export interface ITool {
  id: string;
  label: string;
}

export interface IToolsDropdownProps {
  tools: ITool[];
  onToolSelect: (_tool: ITool) => void;
  isMobile?: boolean;
  testSelector?: string;
}

export interface ISearchInputProps {
  placeholder: string;
  onSearch: (_query: string) => void;
  testSelector?: string;
}