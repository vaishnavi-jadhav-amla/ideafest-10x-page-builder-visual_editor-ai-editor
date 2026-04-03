import { IQuoteSearchByKey, IQuoteSort } from "./quote";

import { IAddress } from "../address";

export interface IPendingOrderList {
  collectionDetails: ICollectionDetails[];
  totalResults: number;
}

export interface IListProps {
  pageSize: number;
  pageIndex: number;
  sortValue: IQuoteSort;
  currentFilters: IQuoteSearchByKey[];
  status: string;
}

export interface ICollectionDetails {
  userName: string;
  jobName?: string;
  total?: string | undefined;
  createdDate?: string | undefined;
  className?: string;
  classNumber: string;
  classStatus?: string;
  orderType?: string;
  accountName?: string;
  customerName?: string;
  currencyCode?: string;
  cultureCode?: string;
  lineItemDetails?: IOrderLineItems[];
  inHandDate?: string;
  classStateName?: string;
  address?: IAddress[];
  shippingMethodName?: string;
  configurationSetCode?: string;
  shippingConstraintCode?: string;
}

export interface IApproverList {
  approverOrder: number;
  approverName: string;
  statusCode: string;
  approvalDate: string;
  isMultiLevel: boolean;
}

export interface IOrderLineItems {
  shippingCost?: number;
  totalPrice: number;
  groupCode: number;
  productImageUrl: string;
  productName?: string;
  productDescription?: string;
  quantity?: number;
  availableQuantity?: number;
  unitPrice?: number;
  sku?: string;
  itemName?: string;
  itemPrice?: number;
  cartItemId?: number;
  orderLineItemState?: string;
  orderLineItemStateName?: string;
  currencyCode?: string;
  productImage: string;
}

export interface IApproverButtonStates {
  showPlaceOrderButton: boolean;
  showRejectButton: boolean;
  showApproveButton: boolean;
}

export interface IUpdatedOrderStatus {
  classNumber: string;
  isSuccess: boolean;
  errorMessage: string;
}

export interface IOrderResponseData {
  copiedQuoteNumber?: string;
  copiedClassNumber?: string;
  isSuccess: boolean;
  errorMessage: string;
}
