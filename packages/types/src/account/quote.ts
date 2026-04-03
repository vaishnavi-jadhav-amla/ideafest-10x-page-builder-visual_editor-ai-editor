import { IAddress } from "../address";
import { IShipmentDetails } from "../order";
import { IPaymentDetails } from "../payment";
import { IOrderLineItems } from "./pending-order";
import { ICalculateSummary, ICommerceCollectionClassDetail } from "./order";

export interface IQuote {
  classNumber: number;
  quoteDate: Date | string;
  quoteExpirationDate: Date | string;
  quoteNumber?: string;
  quoteStatus: string;
  totalAmount: number;
  omsQuoteId: number;
  currencyCode?: string;
}
export interface IQuoteResponse {
  paginationDetail: IPageDetails;
  collectionDetails: IQuote[];
  pageIndex: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}
export interface IPageDetails {
  pageIndex: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}
export interface IQuoteSearchByKey {
  key: string;
  value: string;
  type: string;
  columns: { status: string; date: string };
}
export interface IQuoteSort {
  [key: string]: string;
}
export interface IQuoteHistoryProps {
  pageSize: number;
  pageIndex: number;
  sortValue: IQuoteSort;
  currentFilters: IQuoteSearchByKey[];
  status: string;
  accountId?:number|null;
}

export interface ITaxSummary {
  omsOrderTaxSummaryId: number;
  omsOrderDetailsId: number;
  omsQuoteTaxSummaryId: number;
  omsQuoteId: number;
  tax: number;
  rate: number;
  taxName: string;
  taxTypeName: string;
}

export interface IQuoteDetailsResponse {
  quoteData?: ICommerceCollectionClassDetail;
  calculateSummary?: ICalculateSummary;
  isSuccess: boolean;
  additionalInstructions: {name: string; information: string; createdBy: string}[];
  quoteNumber?: string;
}

export interface IQuoteDetails {
  accountName?:string;
  paymentDetails?: IPaymentDetails;
  quoteNumber?: number;
  configurationSetCode: string;
  classNumber?: string | undefined;
  createdDate?: string;
  classStateName?: string | undefined;
  userName?: string | undefined;
  total?: string | undefined;
  createdByFullName?: string | undefined;
  cultureCode?: string | undefined;
  lineItemDetails?: IOrderLineItems[];
  orderShipments?: IShipmentDetails;
  address?: IAddress[];
  expirationDate?: string;
  phoneNumber?: string | undefined;
  inHandDate?: string | undefined;
  billingAddress?: string;
  jobName?: string;
  shippingAddressId?: number;
  billingAddressId?: number;
  isShippingConstraint?: boolean;
  shippingAddress: IAddress;
  enableConvertToOrder?: boolean;
  shippingTypeName?: string;
  shippingConstraintCode?: string;
  shippingMethodName?: string;
}
