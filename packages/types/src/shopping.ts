import { IAddress, IShippingConstraints } from "./address";
import { IAssociatedProduct, IGroupProductsDetails, IProductDetails } from "./product-details";
import { IOrderShipping, ITaxSummary, IVoucher } from "./account";

import { IAssociatedPublishedBundleProductModel } from "./product";
import { IBase } from "./base";
import { IOrderDiscountModel } from "./order";
import { IPayment } from "./payment";
import { IUser } from "./user";

export interface ISelectValuesModel {
  value?: string;
  code?: string;
}
export interface DeserializeOrderProductAttributeValueModel {
  attributeCode?: string;
  attributeValue?: string;
  isConfigurable?: boolean;
  attributeDefaultValueCode?: string;
  orderProductId?: string;
  selectedValues?: ISelectValuesModel[];
}

export interface IPersonaliseValueModel {
  personaliseCode?: string;
  personaliseValue?: string;
  designId?: string;
  thumbnailURL?: string;
  personaliseName?: string;
  omsSavedCartLineItemId?: number;
  groupIdentifier?: number;
}

// This Interface is deprecated.
//  Please use `packages/base-components/src/http-request/cart/get-cart-items.ts` to get cart items,
//  and `api/cart/cart-summary` to retrieve cart calculations.
export interface IShoppingCartItem extends IBase {
  productImageUrl: string;
  productDescription: string;
  attributes?: DeserializeOrderProductAttributeValueModel[];
  personalizeValuesDetail?: IShoppingCartItem[];
  omsOrderLineItemsId?: number;
  groupId?: string;
  portalId?: number;
  localeId?: number;
  productId?: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  extendedPrice?: number;
  omsSavedcartLineItemId?: number;
  imagePath?: string;
  productImagePath?: string;
  externalId?: string;
  groupSequence?: number;
  isAllowedTerritories?: boolean;
  shippingCost?: number;
  product?: IProductDetails;
  seoPageName?: string;
  quantityOnHand?: number;
  configurableProductSKUs?: string;
  customShippingCost?: number;
  productDiscountAmount?: number;
  taxCost?: number;
  importDuty?: number;
  perQuantityLineItemDiscount?: number;
  perQuantityCSRDiscount?: number;
  perQuantityShippingCost?: number;
  perQuantityShippingDiscount?: number;
  perQuantityOrderLevelDiscountOnLineItem?: number;
  perQuantityVoucherAmount?: number;
  additionalCost?: { [key: string]: number };
  maxQuantity?: number;
  minQuantity?: number;
  bundleProductSKUs?: string;
  parentProductId?: number;
  productType?: string;
  groupProducts?: IGroupProductsDetails[];
  cartDescription?: string;
  associatedAddOnProducts?: IAssociatedProduct[];
  addOnQuantity?: number;
  addOnProductSKUs?: string;
  personalisedCodes?: string;
  personalisedValues?: string;
  productCode?: string;
  omsTemplateLineItemId?: number;
  omsTemplateId?: number;
  groupProductsQuantity?: string;
  groupProductSKUs?: string;
  personaliseValuesList?: { [key: string]: string };
  autoAddonSKUs?: string;
  personaliseValuesDetail?: IPersonaliseValueModel[];
  omsQuoteLineItemId?: number;
  insufficientQuantity?: boolean;
  initialPrice?: number;
  seoTitle?: string;
  seoUrl?: string;
  defaultInventoryCount?: string;
  outOfStockMessage?: string;
  description?: string;
  isUnAssociatedProductEntity?: boolean;
  addonGroupName?: string;
  isRemoveProduct?: boolean;
  trackInventory?: boolean;
  orderLineItemRelationshipTypeId?: number;
  bundleProducts?: IAssociatedPublishedBundleProductModel[];
  allowBackOrder?: boolean;
  productUrl?: string;
  sku?: string;
}

// This Interface is deprecated.
//  Please use `packages/base-components/src/http-request/cart/get-cart-items.ts` to get cart items,
//  and `api/cart/cart-summary` to retrieve cart calculations.
export interface IShoppingCart extends IBase {
  // coupons?: ICoupon[];
  isCalculateVoucher?: boolean;
  orderTotalWithoutVoucher?: number;
  vouchers?: IVoucher[];
  shippingConstraints?: IShippingConstraints[];
  inHandDate?: Date;
  roleName?: string;
  permissionCode?: string;
  budgetAmount?: number;
  orderStatus?: string;
  customerPaymentGUID?: string;
  isLevelApprovedOrRejected?: boolean;
  isLastApprover?: boolean;
  omsQuoteId?: number;
  errorMessage?: string;
  isValidShippingSetting?: boolean;
  hasError?: boolean;
  shippingResponseErrorMessage?: string;
  isSinglePageCheckout?: boolean;
  isQuoteRequest?: boolean;
  taxCost?: number;
  shippingCost?: number;
  additionalInstruction?: string;
  shippingAddressId?: number;
  profileId?: number;
  selectedAccountUserId?: number;
  billingAddressId?: number;
  billingEmail?: string;
  isCalculateTaxAndShipping?: boolean;
  shippingAddress?: IAddress;
  shippingId?: number;
  jobName?: string;
  additionalInstructions?: string;
  isQuoteOrder?: boolean;
  isCalculatePromotionAndCoupon?: boolean;
  currencyCode?: string;
  currencySuffix?: string;
  total?: number;
  subTotal?: number;
  cultureCode?: string;
  localeId?: number;
  portalId?: number;
  publishedCatalogId?: number;
  userId?: number;
  cookieMappingId?: string;
  shoppingCartItems?: IShoppingCartItem[];
  shippingHandlingCharges?: number;
  shipping?: IOrderShipping;
  skipCalculations?: boolean;
  transactionDate?: Date;
  ccCardExpiration?: string;
  transactionId?: string;
  omsOrderStatusId?: number;
  isOrderFromWebstore?: boolean;
  skipPreprocessing?: boolean;
  orderLevelDiscount?: number;
  orderLevelShipping?: number;
  orderLevelTaxes?: number;
  csrDiscountAmount?: number;
  shippingDifference?: number;
  customShippingCost?: number;
  taxRate?: number;
  salesTax?: number;
  vat?: number;
  gst?: number;
  hst?: number;
  pst?: number;
  customTaxCost?: number;
  totalAdditionalCost?: number;
  giftCardBalance?: number;
  creditCardNumber?: string;
  cardType?: string;
  creditCardExpMonth?: number;
  creditCardExpYear?: number;
  shippingConstraintCode?: string;
  freeShipping?: boolean;
  orderDate?: Date;
  orderNumber?: string;
  billingAddress?: IAddress;
  userDetails?: IUser;
  taxSummaryList?: ITaxSummary[];
  taxMessageList?: string[];
  shippingDiscount?: number;
  giftCardAmount?: number;
  importDuty?: number;
  discount?: number;
  payment?: IPayment;
  publishStateId?: number;
  token?: string;
  isGatewayPreAuthorize?: boolean;
  isPendingOrderRequest?: boolean;
  quotesAccountId?: number;
  additionalNotes?: string;
  portalPaymentGroupId?: number;
  purchaseOrderNumber?: string;
  poDocumentName?: string;
  isPendingPayment?: boolean;
  quotePaymentSettingId?: number;
  quoteTypeCode?: string;
  customerServiceEmail?: string;
  giftCardNumber?: string;
  isAllVoucherRemoved?: boolean;
  shippingType?: string;
  groupSequence?: number;
  isAllowedTerritories?: boolean;
  isUnAssociatedProductEntity?: boolean;
  isRemoveProduct?: boolean;
  orderLevelDiscountDetails?: IOrderDiscountModel[];
}

export interface IUpdateOrderPayment {
  classNumber: string;
  billingAddressId: number;
  userId?: number;
}

export interface IUpdateOrderShipment {
  classNumber: string;
  shippingId?: number | undefined;
  userId?: number;
  shippingAddressId?: number;
  inHandDate?: Date | undefined;
  shippingConstraintCode?: string | undefined;
  isShipCompletely?: boolean | undefined;
}
