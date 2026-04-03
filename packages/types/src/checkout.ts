import { Dispatch, SetStateAction } from "react";
import { ICardDetails, IPaymentAddress, IPaymentDetails, IPaymentOption } from "./payment";

import { IBase } from "./base";
import { ICheckoutRecaptcha } from "./common";
import { IGeneralSetting } from "./general-setting";
import { IShippingConstraints } from "./address";
import { IUser } from "./user";

export interface ICheckout extends IBase {
  userId?: number;
  quoteId?: number;
  budgetAmount?: number;
  inHandDate?: Date;
  subTotal?: number;
  total?: number;
  isQuoteRequest?: boolean;
  orderLimit?: number;
  enableApprovalRouting?: boolean;
  submitApproval?: boolean;
  permission?: boolean;
  isLastApprover?: boolean;
  approverCount?: boolean;
  approvalType?: string;
  isRequireApprovalRouting?: boolean;
  creditCardNumber?: string;
  shippingId?: number;
  permissionCode?: string;
  orderStatus?: string;
  roleName?: string;
  isPendingOrderRequest?: boolean;
  isLevelApprovedOrRejected?: boolean;
  shippingConstraints?: IShippingConstraints[];
  showPlaceOrderButton?: boolean;
  enableShippingAddressSuggestion?: boolean;
}

export interface ISubmitOrder extends IBase {
  ccExpiration?: string;
  transactionId?: string;
  gatewayCode?: string;
  total?: number;
  additionalInstruction?: string;
  creditCardNumber?: string;
  cardType?: string;
  creditCardExpMonth?: number;
  creditCardExpYear?: number;
  inHandDate?: Date;
  jobName?: string;
  shippingConstraintCode?: string;
  shippingMethod?: string;
  accountNumber?: string;
  shippingOptionId?: number | null;
  shippingAddressId?: number;
  billingAddressId?: number;
  userId?: number;
  orderNumber?: string;
  isOrderFromAdmin?: boolean;
  cartNumber?: string;
  orderResponse?: IConvertedToOrderResponse;
  paymentDetails?: IPaymentDetails;
}

export interface IConvertToOrder {
  userId: number;
  orderStateId?: number;
  additionalInstruction?: IAdditionalInstruction;
  paymentDetails?: IPaymentDetails;
  statusCode?: string;
  targetClassType?: string;
  accountCode?: string;
}

export interface IAdditionalInstruction {
  name?: string;
  information?: string;
}

export interface IConvertedToOrderResponse {
  orderId?: string;
  isSuccess?: boolean;
  orderNumber?: string;
  orderStatusCode?: string;
  errorMessage?: string;
  errorCode?: number;
  hasError?: boolean;
  status?: boolean;
}

export interface ICheckoutSubmitOrderRequest {
  setIsDisabled?: Dispatch<SetStateAction<boolean>>;
  setIsFullPageLoading?: Dispatch<SetStateAction<boolean>>;
  isDisabled?: boolean;
  showPlaceOrder?: boolean;
  jobName?: string;
  additionalInstruction?: string;
  isFromQuote?: boolean;
  isAddEditAddressOpen: { isShippingAddressOpen: boolean; isBillingAddressOpen: boolean };
  total: number;
  isApprovalPaymentStatus?: boolean;
  isSubmitForApprovalFlag?: boolean;
  approvalType?: string | undefined;
  enableApprovalRouting?: boolean;
  orderLimit?: number | undefined;
  isPaymentSelected?: boolean;
  isOABFlagOn?: boolean;
  recaptchaDetails?: ICheckoutRecaptcha;
  voucherAmount?: number;
  userDetails?: IUser;
  isMobileButton?: boolean;
  currencyCode?: string;
}
export interface IPaymentOptionsProps {
  paymentOptions: IPaymentOption[];
  generalSetting?: IGeneralSetting;
  total: number;
  jobName?: string;
  additionalInstruction?: string;
  setPaymentProcessing: Dispatch<SetStateAction<boolean>>;
  setIsDisabled?: Dispatch<SetStateAction<boolean>>;
  setShowPlaceOrder?: Dispatch<SetStateAction<boolean>>;
  isFromQuote?: boolean;
  quoteNumber?: string;
  currencyCode?: string;
  setIsPaymentSelected?: Dispatch<SetStateAction<boolean>>;
  isOfflinePayment: boolean;
  isOABFlagOn?: Dispatch<SetStateAction<boolean>>;
  approvalType?: string;
  enableApprovalRouting?: boolean;
  isApprovalPaymentStatus?: Dispatch<SetStateAction<boolean>>;
  isAddEditAddressOpen?: {
    isShippingAddressOpen: boolean;
    isBillingAddressOpen: boolean;
  };
  setIsBillingAddressOptional?: Dispatch<SetStateAction<boolean>>;
  voucherAmount?: number;
  orderLimit?: number | undefined;
  approvalSetting?: boolean;
}

export interface ISubmitPaymentModel {
  billingAddress: IPaymentAddress;
  cardDetails: ICardDetails;
  paymentMethodToken: string;
  paymentDetailsToken: string;
  paymentPluginName: string;
  configurationSetCode: string;
  paymentSubTypeCode: string;
  isCapture: boolean;
  isSaveCreditCard: boolean;
  orderNumber: string;
  total: number;
  isOfflinePayment: boolean;
  creditCardVerification: string;
  customerGuid: string;
  isSavedPaymentMethod: boolean;
}

export interface IGenerateFinalizeNumber {
  finalClassNumber?: string;
  classType: string;
  status: boolean;
  isSuccess?: boolean;
}

export interface ICSRDiscountTaxExemptProps {
  applyLoading: boolean;
  isFromQuote?: boolean;
  checked: boolean;
  message: string;
  onCheckboxChange: (_value: boolean) => void;
  onApply: (_data: { discount: string }) => void;
  handleRemoved: () => void;
  setDiscountMessage: Dispatch<SetStateAction<string>>;
}

export interface IConfirmRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
