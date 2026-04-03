import { ICartItem, ICartSummary, ICosts } from "../cart";

import { IAddress } from "../address";
import { IBase } from "../base";
import { IFilterTuple } from "../filter";
import { IOrderLineItems } from "./pending-order";
import { IPaymentDetails } from "../payment";
import { IShipmentDetails } from "../order";
import { ITaxSummary } from "./quote";

export interface IOrdersList {
  orderNumber: string;
  paymentStatus: string;
  orderState?: string;
  statusCode?: string;
  orderDate?: string;
  currencyCode?: string;
  total?: number;
  paymentDisplayName?: string;
  subTypeCode?: string;
  remainingOrderAmount?: number;
}

export interface IOrdersResponse {
  orders: IOrdersList[];
  customerName: string;
  isEnableReturnRequest: boolean;
  pageIndex: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}

export interface IOrderSearchByKey {
  key: string;
  value: string;
  type: string;
  columns: { status: string; date: string };
}

export interface IOrderSort {
  [key: string]: string;
}

export interface IRecords {
  name: string;
  value: string | number | null;
}

export interface IOrderProductDetail {
  item: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface IPricingItem {
  name: string;
  value: number;
}

export interface IOrderInvoiceData {
  currencyCode: string;
  orderDate: string;
  orderNumber: string;
  detailsColumn: IRecords[];
  billingColumn: { name?: string; value: string }[];
  shippingColumn1: string;
  shippingEmail: string;
  shippingColumn2: IRecords[];
  productDetails: IOrderProductDetail[];
  productPricing: IPricingItem[];
  orderTotal: IPricingItem[];
  shippingColumn: { name?: string; value: string }[];
  hideBillingAddress: { name?: string; value: boolean }[];
}

export interface IOrderData {
  firstName: string | null;
  orderNumber: string;
  currencyCode: string;
  orderDate: string;
  paymentDisplayName?: string | null;
  trackingNumber: string;
  jobName: string;
  address1: string | null;
  billingAddress: BillingAddress;
  orderLineItems: OrderLineItem[];
  subTotal: number;
  inHandDate?: string | null;
  shippingConstraintCode: string;
  shippingHandlingCharges: number;
  taxCost: number;
  importDuty: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
}

export interface OrderLineItem {
  shippingAddressHtml: string;
  productName: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  cityName: string;
  postalCode: string;
  countryName: string;
  emailAddress: string;
  phoneNumber: string;
  stateName: string;
}

export interface IOrder {
  userId: number;
  orderNumber: string;
  paymentStatus: string;
  orderAmount: number;
  orderDate?: string;
  currencyCode: string;
  statusCode: string;
  omsOrderId: number;
  subTypeCode: string;
  userName: string;
  orderState: string;
  total?: number;
  paymentDisplayName?: string;
  remainingOrderAmount?: number;
  classNumber?: string;
  classStatus?: string;
  paymentName?: string;
  customerName: string;
  cultureCode: string;
  createdDate?: string | undefined;
}

export interface IParameterKey {
  parameterKey?: string;
  ids: string;
}

export interface IOrderInvoiceDetails extends IBase {
  filterIds?: IParameterKey;
  expand?: string[] | undefined;
  filter?: IFilterTuple[] | undefined;
  sort?: { [key: string]: string } | undefined;
  pageIndex?: number;
  pageSize?: number;
}

export interface IOrderDetails {
  accountName?: string;
  convertedClassNumber?: string;
  userName: string | undefined;
  shippingAddress: IAddress;
  billingAddress: IAddress;
  calculateSummary: ICartSummary;
  userId: number;
  storeName?: string;
  orderState: string;
  orderNumber: string;
  email: string;
  currencyCode: string;
  omsOrderId: number;
  total?: number;
  orderLineItems: IOrderLineItem[];
  paymentHistoryList: IPaymentHistoryList;
  paymentDisplayName?: string | undefined;
  createdDate?: string;
  trackingNumber?: number;
  billingAddressHtml?: string;
  subTotal: number;
  taxCost?: number;
  importDuty?: number;
  discountAmount?: number;
  shippingHandlingCharges?: number;
  shippingConstraintCode?: string;
  remainingOrderAmount?: number;
  paymentSubTypeCode: string;
  giftCardAmount?: number;
  shippingCost: number;
  inHandDate?: string;
  jobName?: string;
  isOrderEligibleForReturn?: boolean;
  returnCharges?: number;
  couponCode?: string;
  voucherNumber?: string;
  statusCode?: string;
  shippingTypeName?: string;
  shippingDiscount?: number;
  omsOrderDetailsId?: number;
  isShippingConstraint: boolean;
  csrDiscountAmount?: number;
  isEnableReturnRequest: boolean;
  isGuestUser: boolean;
  priceRoundOff: number;
  shoppingCartModel?: {
    shoppingCartItems: IShoppingCartItem[];
  };
  address?: IAddress[];
  isBillingAddressOptional: boolean;
  classNumber?: string;
  finalClassNumber?: string;
  configurationSetCode?: string;
  paymentStatusCode?: string;
}

export interface IShoppingCartItem {
  sKU: string;
  productType: string;
}

export interface IOrderLineItem {
  id: string;
  price: number;
  name: string;
  quantity: number;
  availableQuantity?: number;
  total: number;
  sku: string;
  description: string;
  currencyCode: string;
  trackingNumber: string;
  orderLineItemState: string;
  orderLineItemStateName?: string;
  productName?: string;
  shippingAddressHtml: string;
  productType: string;
  omsOrderLineItemsId?: number;
  personaliseValuesDetail: IPersonalized[];
  parentOmsOrderLineItemsId?: number;
  personaliseValueList?: { [key: string]: string };
  shippingCost?: number;
}
interface IPersonalized {
  personalizeName: string;
  personalizeValue: string;
}
export interface IPaymentHistory {
  paymentDate: string;
  paymentStatusName: string;
  subTypeDisplayName: string;
  paidAmount: string;
  remainingOrderAmount: string;
}

export interface IApproverDetails {
  isApprover?: boolean;
  hasApprovers?: boolean;
}

export interface IPaymentHistoryList {
  paymentHistoryList: IPaymentHistory[];
}

export interface IOrderReceiptParams {
  orderId: number;
  isReceipt: boolean;
  isPriceRoundOff?: boolean;
  enableReturnOrderRequest?: boolean;
  receiptModule?: string;
}
export interface IReasonType {
  rmaReasonForReturnId: number;
  rmaReasonForReturn?: string;
  reason?: string;
}

export interface IOrderReceipt {
  commerceCollectionClassDetail?: ICommerceCollectionClassDetail;
  calculateSummary?: ICalculateSummary;
  hasError: boolean;
}

export interface IOrderDiscount {
  discountType: string;
  discountCode: string;
}

export interface ICommerceCollectionClassDetail {
  quoteDetails: ICartItem[];
  convertedClassNumber?: number;
  isGuestUser?: boolean;
  quoteNumber?: number;
  statusCode?: string;
  configurationSetCode: string;
  shippingType?: string;
  enableConvertToOrder?: boolean;
  classCode?: string | undefined;
  classNumber?: string | undefined;
  accountId?: number | undefined;
  type?: string | undefined;
  origin?: string | undefined;
  createdDate?: string;
  classStateName?: string | undefined;
  userName?: string | undefined;
  total?: string | undefined;
  createdByFullName?: string | undefined;
  modifiedByFullName?: string | undefined;
  assignToFullName?: string | undefined;
  cultureCode?: string | undefined;
  lineItemDetails?: IOrderLineItems[];
  orderShipments?: IShipmentDetails;
  orderDiscounts?: IOrderDiscount[];
  address?: IAddress[];
  expirationDate?: string;
  jobName?: string;
  phoneNumber?: string | undefined;
  storeName?: string | undefined;
  inHandDate?: string | undefined;
  paymentDetails?: IPaymentDetails;
  additionalInstructions?: unknown;
  orderShipmentId?: string;
  orderAddressId?: string;
  shippingId?: number;
  shipDate?: string;
  isShipCompletely?: boolean;
  shippingConstraintCode?: string;
  addressId?: number;
  shippingMethodName?: string;
  hasError?: boolean;
  userId?: number;
  shippingTypeName?: string;
  isOrderEligibleForReturn?: boolean;
  remainingOrderAmount?: number;
  paymentDate?: Date;
  amount?: number;
  currencyCode?: string;
  couponCode?: string;
  billingAddress?: string;
  shippingAddressId?: number;
  billingAddressId?: number;
  isShippingConstraint?: boolean;
  shippingAddress: IAddress;
  shippingCost: number;
  paymentHistoryList?: IPaymentHistory[];
  accountName?: string;
  finalClassNumber?: string;
}

export interface ICalculateSummary {
  taxCost: number;
  shippingCost: number;
  totalDiscount: number;
  handlingFee?: number;
  cartId?: string | undefined;
  costFactorResponse?: ICosts[];
  discountFactorResponse?: unknown[] | undefined;
  subTotal: number;
  total: number;
  hasError?: boolean;
  csrDiscountAmount?: number;
  tax?: number;
  returnCharges?: number;
  giftCardAmount?: number;
  shipping?: number;
  taxSummaryList?: ITaxSummary[];
  shippingDiscount?: number;
  csrDiscount?: number;
  importDuty?: number;
}

export interface IConvertToOrder {
  userId: number;
  orderStateId?: number;
  additionalInstruction?: unknown;
  paymentDetails?: unknown;
  statusCode?: string | undefined;
  targetClassType?: string | undefined;
  accountCode?: string | undefined;
}

export interface IConvertedToOrderResponse {
  orderId?: string;
  isSuccess?: boolean;
  orderNumber?: string | undefined;
  statusCode?: string | undefined;
}

export interface IOrderShipping {
  shippingId?: number;
  shippingName?: string;
  shippingDiscountDescription?: string;
  responseCode?: string;
  responseMessage?: string;
  shippingCountryCode?: string;
  shippingHandlingCharge?: number;
  shippingDiscount?: number;
  isValidShippingSetting?: boolean;
  shippingDiscountApplied?: boolean;
  shippingCode?: string;
  shippingTypeName?: string;
  accountNumber?: string;
  shippingMethod?: string;
  omsOrderDetailsId?: number;
  userId?: number;
  shippingTypeId?: number;
  shippingDiscountType?: number;
}

export interface IOrderFilters {
  key: string;
  value: string;
  type: string;
  columns: {
    status: string;
    date: string;
  };
}

export interface IOrderListRequest {
  sortValue: ISortValue;
  pageIndex: number;
  pageSize: number;
  currentFilters?: IOrderFilters[] | null;
  orderType?: string;
  accountId?: number | null;
}

export interface IOrderListResponse {
  data: IOrderHistoryResponse;
  status: string;
  message: string;
}

interface ISortValue {
  [key: string]: string | number | boolean;
}

export interface IOrderHistoryResponse {
  orders: IOrder[];
  totalResults: number;
  isEnableReturnRequest: boolean;
}

export interface IOrderDetailsProps {
  [key: string]: string | number;
}
