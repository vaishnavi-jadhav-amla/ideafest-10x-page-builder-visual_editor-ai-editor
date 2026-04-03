import { IAdditionalInstructionRequestModel, ICalculateSummary, ICartItem, ICosts, IDiscountFactor } from "./cart";

import { IAddressDetails } from "./address";
import { IAttributeDetails } from "./attribute";
import { IPaymentDetails } from "./payment";

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

export interface IOrderDiscountModel {
  createdBy?: number;
  createdDate?: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
  actionMode?: string;
  custom1?: string;
  custom2?: string;
  custom3?: string;
  custom4?: string;
  custom5?: string;
  omsOrderDiscountId?: number;
  omsOrderDetailsId?: number;
  omsOrderLineItemId?: number;
  omsDiscountTypeId?: number;
  discountCode?: string;
  discountAmount?: number;
  originalDiscount?: number;
  description?: string;
  discountType?: string;
  perQuantityDiscount?: number;
  parentOmsOrderLineItemsId?: number;
  discountMultiplier?: number;
  discountLevelTypeId?: number;
  promotionName?: string;
  promotionTypeId?: number;
  discountAppliedSequence?: number;
  promotionMessage?: string;
  sku?: string;
  groupId?: string;
}

export interface IUpdateOrderPayment {
  classNumber: string;
  billingAddressId: number;
  userId?: number;
  paymentDetails: IPaymentDetails;
  isDeclined?: boolean;
  costDetails?: ICostDetails;
  isPaymentVerified?: boolean;
  isPaymentAuthorized?: boolean;
  isPaymentCaptured?: boolean;
}

export interface ICostDetails {
  remainingOrderAmount?: number;
  paidAmount?: number;
}
export interface IOrderReceipt {
  commerceCollectionClassDetail?: ICommerceCollectionClassDetail;
  calculateSummary?: ICalculateSummary;
  hasError: boolean;
}

export interface ICommerceCollectionClassDetail {
  shippingType?: string;
  enableConvertToOrder?: boolean;
  classCode?: string;
  classNumber?: string;
  accountId?: number;
  type?: string;
  origin?: string;
  createdDate?: string;
  classStateName?: string;
  userName?: string;
  total?: string;
  createdByFullName?: string;
  modifiedByFullName?: string;
  assignToFullName?: string;
  cultureCode?: string;
  lineItemDetails?: ICartItem[];
  orderShipments?: IShipmentDetails;
  orderDiscounts?: IDiscountFactor[];
  address?: IAddressDetails[];
  expirationDate?: Date;
  jobName?: string;
  phoneNumber?: string;
  storeName?: string;
  inHandDate?: string;
  paymentDetails?: IPaymentDetails;
  additionalInstructions?: IAdditionalInstructionRequestModel;
  hasError?: boolean;
  subTotal?: number;
  costFactorResponse: ICosts[];
}

//TODO deprecated : Remove this interface instead use ICartItem. Do not refer for future use.
export interface ILineItemDetails {
  sku?: string;
  productImageUrl?: string;
  itemId?: string;
  productName?: string;
  productDescription?: string;
  quantity?: number;
  unitPrice?: number;
  groupCode?: string;
  productImagePath?: string;
  productType?: string;
  seoUrl?: string;
  itemPrice?: number;
  totalPrice?: number;
  itemName: string;
  cartItemId: number;
}

export interface IShipmentDetails {
  orderShipmentId?: string;
  orderAddressId?: string;
  shippingId?: number;
  shipDate?: string;
  isShipCompletely?: boolean;
  shippingConstraintCode?: string;
  phoneNumber?: string;
  addressId?: number;
  shippingMethodName?: string;
  trackingNumber?: string | undefined;
  inHandDate?: string;
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

export interface IReorderRequestModel {
  orderNumber?: string | undefined;
  orderOrigin?: string | undefined;
  itemId?: string | undefined;
}

export interface IReturnProductList {
  productName: string;
  sku: string;
  availableQty: number;
  confirmedQuantity?: number;
  editQty?: number;
  unitPrice: number;
  imageUrl: string;
  productId: string;
  calculateId?: string;
  productType: string;
  productDescription: string;
  currencyCode: string;
  seoUrl: string | null;
  status: string;
  statusName: string;
  reason?: string;
  isInvalid?: boolean;
  isReturnShipping?: boolean;
  expectedReturnQuantity?: number;
  shippingCost?: number;
  reasonCode: string;
  reasonForReturn: string;
  validationMessage?: string | null;
}

export interface IReturnReason {
  reasonCode: string;
  reason: string;
}

export interface IReturnOrderResponse {
  classNumber: string;
  convertedClassNumber: string;
  classType: string;
  orderNumber?: string;
  note?: string;
  orderStatus: string;
  orderDate: string;
  createdDate?: string;
  total: number;
  orderTotal: number;
  currencyCode: string;
  currencySuffix: string;
  isEligible: boolean;
  isMatch?: boolean;
  isValidOrderNumber: boolean;
  priceRoundOff: number;
  productList?: IReturnProductList[];
  reasonList?: IReturnReason[];
  userId: number;
}

export interface IAdditionalCostResponseModel {
  code?: string | undefined;
  value?: string | undefined;
}

export interface IChildItemDetailsResponseModel {
  itemId?: string;
  sku?: string;
  productName?: string;
  productDescription?: string;
  availableQuantity?: number;
  confirmedQuantity?: number;
  quantity?: number;
  editQty?: number;
  attributes?: IAttributeDetails[];
  unitPrice?: number;
  znodeProductId?: number;
  additionalCost?: IAdditionalCostResponseModel[];
  seoUrl?: string;
  productType?: string;
  totalPrice?: number;
  itemPrice?: number;
  productImagePath?: string;
  statusCode?: string;
  statusName?: string;
  reasonForReturn?: string;
  reasonCode?: string;
  rmaReasonForReturnId: number;
  shippingCost: number;
  reasonForCode?: string;
  isReturnShipping?: boolean;
}

export interface ILineItemDetailsResponseModel {
  itemId?: string;
  calculateId?: string;
  productName?: string;
  productDescription?: string;
  quantity?: number;
  attributes?: IAttributeDetails[];
  availableQuantity?: number;
  confirmedQuantity?: number;
  unitPrice?: number;
  sku?: string;
  childItemList?: IChildItemDetailsResponseModel[];
  groupCode?: string;
  additionalCost?: IAdditionalCostResponseModel[];
  productImagePath?: string;
  productType?: string;
  seoUrl?: string;
  itemPrice?: number;
  totalPrice?: number;
  statusCode?: string;
  statusName?: string;
  reasonCode?: string;
  reasonForCode?: string;
  reasonForReturn?: string;
  shippingCost?: number;
  isReturnShipping?: boolean;
  rmaReasonForReturnId?: number;
}
export interface IRequestProductReturnDetails {
  lineItemId?: string;
  calculateId?: string;
  orderProductId?: string;
  reasonCode?: string;
  quantity: number;
  reasonForReturn?: string;
}

export interface ICreateReturnResponse {
  isSuccess?: boolean;
  message?: string;
  classNumber?: string;
}
export interface IReturnCalculateRequestModel {
  classNumber?: string;
  userId?: number;
  returnCalculateLineItem?: IReturnCalculateLineItemRequestModel[] | undefined;
}

export interface IReturnCalculateLineItemRequestModel {
  orderProductId?: string | undefined;
  lineItemId?: string | undefined;
  quantity?: number;
  confirmedQuantity?: number;
  expectedReturnQuantity?: number;
  reasonCode?: string;
  reasonForReturn?: string | undefined;
  isShippingReturn?: boolean;
}

export interface IReturnCalculateSummaryResponseModel {
  orderId?: string;
  userId?: number;
  returnCalculateLineItem?: IReturnCalculateLineItemSummaryResponseModel[] | undefined;
  returnSubTotal?: number;
  returnTaxCost?: number;
  returnShippingCost?: number | undefined;
  cultureCode?: string | undefined;
  isAdminRequest?: boolean;
  discount?: number;
  csrDiscount?: number;
  returnShippingDiscount?: number;
  returnCharges?: number;
  voucherAmount?: number;
  readonly returnTotal?: number;
  paymentStatusId?: number;
  returnImportDuty?: number;
}

export interface IReturnCalculateLineItemSummaryResponseModel {
  orderProductId?: string | undefined;
  reasonForReturnId?: number;
  reasonForReturn?: string | undefined;
  expectedReturnQuantity?: number;
  unitPrice?: number;
  totalLineItemPrice?: number;
  omsOrderLineItemId?: string;
  errorMessage?: string | undefined;
  hasError?: boolean;
  taxCost?: number;
  cultureCode?: string | undefined;
  isShippingReturn?: boolean;
  shippingCost?: number | undefined;
  returnedQuantity?: number | undefined;
  rmaReturnLineItemsId?: number;
  perQuantityLineItemDiscount?: number;
  perQuantityCsrDiscount?: number;
  perQuantityShippingDiscount?: number;
  perQuantityShippingCost?: number;
  perQuantityOrderLevelDiscountOnLineItem?: number;
  paymentStatusId?: number | undefined;
  perQuantityVoucherAmount?: number;
  parentOmsOrderLineItemsId?: number | undefined;
  importDuty?: number;
}

export interface IReturnCalculateResponse {
  // orderId?: string;
  // userId?: number;
  // returnCalculateLineItem?: IReturnCalculateLineItemSummaryResponseModel[] | undefined;
  returnSubTotal?: number;
  returnTaxCost?: number;
  returnShippingCost?: number | undefined;
  cultureCode?: string | undefined;
  discount?: number;
  csrDiscount?: number;
  returnShippingDiscount?: number;
  returnCharges?: number;
  voucherAmount?: number;
  readonly returnTotal?: number;
  // isAdminRequest?: boolean;
  // paymentStatusId?: number;
  // returnImportDuty?: number;
}

export interface IAddressResponse {
  AddressId: number;
  FirstName: string;
  LastName: string;
  CityName: string;
  StateName: string;
  StateCode: number;
  PostalCode: string;
  CompanyName: string;
  PhoneNumber: string;
  CountryName: string;
  Address1: string;
  Address2: string;
  IsBilling: boolean;
  IsShipping: boolean;
  DisplayName: string;
}

export interface IReturnReceiptData {
  classNumber: string;
  barCodeImage: string;
  totalAmount: number;
  subTotal?: number;
  totalQty: string;
  createdDate: string;
  classStateName: string;
  linkedClassNumber: string;
  currencyCode: string;
  currencySuffix: string;
  lineItemDetails: IReturnProductList[];
  costFactorResponse: ICostFactor[];
  shippingAddress: string;
  billingAddress: string;
  notes?: INoteDetails[];
  calculateSummary?: IReturnCalculateResponse;
  priceRoundOff: number;
}
export interface INoteDetails {
  notes: string;
  date: string;
  updatedBy: string;
  time: string;
}

export interface IReturnLineItem {
  productName: string;
  sku: string;
  availableQty: number;
  unitPrice: number;
  imageUrl: string;
  productId: string;
  productType: string;
  productDescription: string;
  seoUrl: string;
  status: string;
}

export interface ICostFactor {
  name: string;
  value: string;
  description: string;
}

export interface IReceiptSummary {
  classNumber?: string;
  createdDate?: string;
  linkedClassNumber?: string;
  classStateName?: string;
  totalQty: number;
  totalReturnAmount: number;
  currencyCode?: string;
  currencySuffix?: string;
}

export interface IReturnOrderProductList {
  productName: string;
  sku: string;
  returnNumber?: string;
  status: string;
  reasonForReturn: string;
  trackingNumber?: string;
  quantity?: number;
  price: number;
  taxCost: number;
  shippingCost?: number;
  currencyCode: string;
  totalPrice: number;
  productId: string;
  productDescription: string;
  priceRoundOff: number;
}

export interface IProductReturnDetails {
  imagePath: string;
  imageUrl: string;
  sku: string;
  productName: string;
  reasonCode: string;
  unitPrice: number;
  availableQty: number;
  quantity: number;
  totalPrice?: number;
  validationMessage?: string | null;
}
export interface IReasonList {
  reasonCode: string;
  reason: string;
}
export interface IReturnDetails {
  classNumber: string | null;
  convertedClassNumber: string | null;
  classType: string | null;
  orderNumber: string | null;
  orderStatus: string | null;
  note: string | null;
  orderDate: string | null;
  orderTotal: string | null;
  currencyCode: string | null;
  total: number;
  currencySuffix: string | null;
  isEligible: boolean;
  priceRoundOff: number;
  isValidOrderNumber: boolean;
  userId: number;
}

export interface IOrderNumberSelectionProps {
  disabled?: boolean;
  defaultSelection?: string;
  handleChangeOrderNumber: (_arg1: string) => void;
}

export interface IReturnOrderAction {
  requestLineItems: IRequestProductReturnDetails[];
  orderNumber: string;
  isValidLineItems: boolean;
  convertedClassNumber: string;
  note: string;
  isEditable: boolean;
  isGuest?: boolean;
  isValidInputQty?: boolean;
  isValid?: boolean;
  userId?: number;
}

export interface IReturnOrderProducts {
  productList: IReturnProductList[];
  onChangeReasonForReturn?: (_arg1: string, _arg2: IReturnProductList, _arg3: string) => void;
  onChangeQuantity?: (_arg1: string, _arg2: IReturnProductList) => void;
  isEditable?: boolean;
  isUpdate?: boolean;
  isReceipt?: boolean;
  isOrderNumberValid?: boolean;
  priceRoundOff?: number;
  reasonList: IReasonList[];
}

export interface IReturnProductTotal {
  calculateDetails: IReturnCalculateResponse | null;
  currencyCode: string;
  isReceipt?: boolean;
  priceRoundOff: number;
}