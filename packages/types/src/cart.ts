import { IOrderShipping, IShoppingCartItem, ITaxSummary } from "./account";

import { IAddress } from "./address";
import { IAttributeDetails } from "./attribute";
import { IBase } from "./base";
import { IPayment } from "./payment";
import { IProductAddOn } from "./product";
import { ISkuDetailsParams } from "./product-details";

export interface ICart {
  cartNumber?: string | null;
  cartItems?: ICartItem[];
  isUnAssociatedProductEntity?: boolean;
}

export interface ICartItem {
  productId: number;
  productLink: string;
  orderLineItemStateName?: string;
  addon?: IProductAddOn[];
  personalization?: IPersonalizedDetail[];
  productImageUrl: string;
  productName: string;
  productDescription: string;
  unitPrice?: number;
  itemPrice?: number;
  totalPrice?: number;
  quantity: number;
  availableQuantity?: number;
  cartItemId: string;
  maximumQuantity: number;
  minimumQuantity: number;
  sku?: string;
  showSku: boolean;
  productType: string;
  hasValidationErrors?: boolean;
  shippingCost?: number;
  orderLineItemState?: string;
  uom?: string;
  isConfigurable?: boolean;
  attributes?: IAttributeDetails[];
  personalizedDetails?: IPersonalizedDetail[];
  addOnSkuList?: IProductAddOn[];
  childItemList?: ICartItemListResponse[];
  outOfStockOption?: string;
  isOutOfStock?: boolean;
}

// Interface for the cart item response from the backend/Agent
export interface ICartItemListResponse {
  shippingCost?: number;
  znodeProductId?: number;
  seoUrl?: string;
  productImagePath?: string;
  productName?: string;
  productDescription?: string;
  unitPrice?: number;
  totalPrice?: number;
  quantity?: number;
  availableQuantity?: number;
  validationDetails?: ICartItemValidation[];
  cartItemId?: string;
  itemId?: string;
  maximumQuantity?: number;
  minimumQuantity?: number;
  sku?: string;
  productType?: string;
  addOnSkuList?: IProductAddOn[];
  personalizedDetails?: IPersonalizedDetail[];
  attributes?: IAttributeDetails[];
  childItemList?: ICartItemListResponse[];
  itemPrice?: number;
  cultureCode?: string;
  statusCode?: string;
  statusName?: string;
  showSku?: boolean;
  productLink?: string;
  isOutOfStock?: boolean;
}

export interface ICartItemValidation {
  code?: number;
  message?: string;
  priority?: number;
  sku?: string;
  errorCode?: number;
}

export interface IPersonalizedDetail {
  id?: string;
  value?: string;
  code?: string;
}

export interface IPersonalizationModel {
  code?: string;
  value?: string;
}

export interface IAddOnSkuResponseModel {
  sku?: string;
  productName?: string;
  groupName?: string;
  unitPrice?: number | undefined;
  validationDetails?: ICartItemValidation[] | undefined;
}
export interface ICartSettings {
  enableQuoteRequest: boolean;
  requireLogin: boolean;
  showPromoSection: boolean;
  enableShippingEstimator: boolean;
  currencyCode: string;
  enableSaveForLater: boolean;
  currencySymbol?: string;
  enableAddressValidation?: boolean;
  enableShippingConstraints?: boolean;
  loginToSeePricingAndInventory?: boolean;
  currentDate?: string;
}

export interface ICartSummary {
  cartId?: string;
  subTotal?: number;
  total?: number;
  totalDiscount?: number;
  shippingCost?: number;
  handlingFee?: number;
  hasDiscount?: boolean;
  currencyCode?: string;
  costs?: ICosts[];
  discounts?: IDiscounts[];
  taxCost?: number;
  shippingDiscount?: number;
  csrDiscountAmount?: number;
  giftCardAmount?: number;
  returnCharges?: number;
  orderTotalWithoutVoucher?: number;
  taxSummaryList?: ITaxSummary[];
  importDuty?: number;
  taxMessageList?: string[];
}

export interface ICosts {
  name: string;
  value: string;
  description?: string;
}

export interface IDiscounts {
  errorMessage?: string;
  discountType?: string;
  discountCode?: string;
  name: string;
  code: string;
  type: string;
  isApplied?: string;
  isValid?: string;
  expiryDate: string;
  message?: string;
  appliedAmount?: number;
  totalAmount: number;
}

export interface IDiscountFactor {
  name: string;
  discountCode?: string;
  discountType?: string;
  isApplied?: string;
  isValid?: string;
  expiryDate?: string;
  message?: string;
  appliedAmount?: number;
  totalAmount?: number;
}
export interface ICalculateSummary {
  cartId?: string;
  costs?: ICosts[];
  discounts?: IDiscountFactor[];
  subTotal?: number;
  total?: number;
  hasError?: boolean;
}

//TO DO Need to Remove this. This model is of no use.
export interface IAddToCart extends IBase {
  cookieMappingId?: string;
  userId?: number;
  portalId?: number;
  localeId?: number;
  shoppingCartItems?: IShoppingCartItem[];
  publishedCatalogId?: number;
  payment?: IPayment;
  discount?: number;
  isCalculatePromotionAndCoupon?: boolean;
  currencyCode?: string;
  currencySuffix?: string;
  total?: number;
  subTotal?: number;
  cultureCode?: string;
  shipping?: IOrderShipping;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  publishStateId?: number;
  omsQuoteId?: number;
  shippingCost?: number;
  shippingHandlingCharges?: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface IAddToCartRequest {
  cartId: string | undefined;
  userId?: number;
  productType?: string;
  skuDetails?: ISkuDetailsParams[];
  orderOrigin?: string;
  notes?: string | undefined;
  catalogCode?: string;
}

export interface IAddToCartResponse {
  isSuccess?: boolean;
  cartId?: string | undefined;
  addToCartStatus: boolean;
  cartNumber?: string | undefined;
  cartCount: number;
}

export interface IPersonalizedPayload {
  code?: string;
  value?: string;
}

export interface IUpdateCartRequest {
  quantity: number;
  sku: string;
}

export interface IUpdatedCartResponse {
  cartNumber: string;
  cartItemId: string;
  quantity: number;
  isSuccess?: boolean;
  sku: string;
}

export interface IValidationsForCartItems {
  errorCode?: number;
  errorMessage?: string | undefined;
  priority?: number;
  sku?: string | undefined;
}

export interface IErrorMessage {
  [key: string]: {
    productID: number;
    message: string;
    isError: boolean;
  };
}

export interface IUpdateCartItemQuantityResponse {
  cartNumber?: string;
  cartItemId?: string;
  quantity?: number;
  isSuccess?: boolean;
  sku?: string;
  validationDetails?: ICartValidation[];
}

export interface ICartValidation {
  readonly errorCode: number;
  readonly errorMessage: string | undefined;
  readonly sku: string | undefined;
  readonly priority: number;
}

export interface ICartItems {
  cartNumber: string | number;
  cartItemId: string | number;
  updateCartQuantity: number;
  sku: string;
  classType: string;
}

export interface ICreateCartRequest {
  orderType: string;
  cartNumber?: string;
  cartItemId?: string;
  targetClassType: string;
  targetClassNumber?: string;
  jobName?: string;
  additionalInstruction?: string;
  templateName?: string;
}

export interface ICreateCartResponse {
  cartNumber: string;
  isSuccess: boolean;
  quoteNumber: string;
}

export interface IAdditionalInstructionRequestModel {
  name?: string | undefined;
  information?: string | undefined;
}

export interface IAddToCartNotification {
  sku: string;
  quantity?: number;
  imageLargePath?: string;
}

export interface IApplyDiscountRequest {
  discountCode: string;
  discountType: string;
  cartNumber: string;
  isCart?: boolean;
  isShippingOptionSelected?: boolean;
  isTaxEmpty?: boolean;
  csrDiscount?: number;
}

export interface IDiscountRequestModel {
  discountType: string;
  discountCode: string | undefined;
  amount: number;
  expands: string[] | undefined;
  isDiscountValid: boolean | undefined;
  discountMessage: string | undefined;
}

export interface IDiscountedDetailsResponseModel {
  discountStatus: IDiscountStatusResponseModel;
  calculatedDetails: ICartSummary;
}

export interface IDiscountStatusResponseModel {
  discountId?: string;
  isSuccess: boolean;
  isValid?: boolean;
  errorMessage?: string | undefined;
}

export interface IConvertedClassResponse {
  convertedClassNumber?: string | undefined;
  isSuccess?: boolean;
  quoteNumber?: string;
  errorMessage?: string;
}
