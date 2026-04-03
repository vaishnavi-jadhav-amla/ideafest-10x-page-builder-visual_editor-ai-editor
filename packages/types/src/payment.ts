import { Dispatch, SetStateAction } from "react";

import { GatewayType } from "./enums";
import { IAddress } from "./address";
import { IBaseResponse } from "./response";

export interface IPaymentOption {
  paymentName: string;
  paymentCode: string;
  paymentId: string;
  paymentType: string;
  gateway: string;
  paymentStatus?: boolean;
  isSelected: boolean;
  isBillingAddressOptional: boolean;
}

export interface IPaymentConfiguration {
  pluginConfigurationSetId?: string | undefined;
  configurationSetCode?: string | undefined;
  configurationSetDisplayName?: string | undefined;
  pluginSubTypeId?: number | undefined;
  externalId?: number | undefined;
  pluginDetailsId?: number;
  name?: string | undefined;
  subType?: string | undefined;
  category?: string | undefined;
  displayOrder?: number;
  displaySettings?: boolean;
  typeName?: string | undefined;
}

export interface IPaymentDetails {
  paymentSubTypeCode: string;
  configurationSetCode: string;
  paymentTransactionToken?: string;
  paymentStatusCode?: string;
  purchaseOrderNumber?: string;
  purchaseOrderDocumentFilePath?: string;
  externalTransactionId?: string;
  paymentName?: string;
  isBillingAddressOptional: boolean;
  isCapture?: boolean;
  creditCardVerification: string;
}

export interface IPluginErrorResponse {
  hasError: boolean;
  error: string;
}

export interface IPaymentPlugin {
  pluginScript: string;
  pluginName: string;
  clientToken: string;
  setInitiatePlaceOrderAction: Dispatch<SetStateAction<boolean>>;
  setInitiateCancelAction: Dispatch<SetStateAction<boolean>>;
  setErrorResponse: Dispatch<SetStateAction<IPluginErrorResponse>>;
  setClientResponse: Dispatch<SetStateAction<string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setInitiateDeleteSavedCard: Dispatch<SetStateAction<any>>;
  setIsSaveCreditCard: Dispatch<SetStateAction<boolean>>;
  setIsSavedPayment: Dispatch<SetStateAction<boolean>>;
  paymentRequest: IPaymentPluginRequest;
}

export interface IPaymentPluginRequest {
  total: string;
  orderId: string;
  billingAddress: IPaymentAddress;
  shippingAddress: IPaymentAddress;
  paymentMethodType: string;
  isGuestUser: boolean;
  isSaveCC: boolean;
  savedPaymentMethods : ISavedPaymentMethod [],
  isSavedPaymentMethod: boolean
}

export interface ISavedPaymentMethod{
    cardNumber : number,
    cardType : string,
    paymentMethodToken : string,
}
export interface IPaymentAddress {
  addressId: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ICardDetails {
  cardExpirationMonth: number;
  cardExpirationYear: number;
  cardLastFourDigit: string;
  cardHolderFirstName: string;
  cardType: string;
  isSaveCC: boolean;
}

export interface IAuthorizePaymentRequest {
  customerId?: string | undefined;
  configurationSetCode: string;
  total: number;
  orderId: string;
  billingAddress: IPaymentAddress;
  shippingAddress?: IPaymentAddress;
  cardDetails?: ICardDetails;
  gatewayCurrencyCode: string;
  //To: do Need to use enum
  //gatewayType: string;
  transactionId: string;
  customerGatewayProfileId: string;
  gatewayPaymentMethodToken: string;
  gatewayAuthenticationToken: string;
  customerGuid: string;
  isSaveCreditCard: boolean;
  isSavedPaymentMethod: boolean;
}

export interface ICapturePaymentRequest {
  transactionId: string;
}

export interface IPaymentCardInformation {
  cardNumber: string;
  cardLastFourDigit: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  cardImageUrl: string;
  cardSecurityCode: string;
  cardHolderFirstName: string;
  cardHolderLastName: string;
  // cardType: CardType;
}

export interface IPaymentConfigurationSetDetails extends IBaseResponse {
  configurationSetCode: string;
  configurationSetDisplayName: string;
  pluginName: string;
  scriptPath: string;
  subType: string;
  isCapture?: boolean;
  isOAB?: boolean;
  enablePODocumentUpload?: boolean;
  isPODocumentUploadRequired?: boolean;
  isBillingAddressOptional?: boolean;
  creditCardVerification?: string;
}

export interface IPaymentResponse {
  isSuccess: boolean;
  transactionId: string;
  externalTransactionId?: string;
  responseCode?: string ;
}

export interface ITokenResponse {
  paymentGatewayToken: string;
}

export interface IFileResponse {
  fileData: string;
}
export interface IUpdateBillingDetailsResponseModel {
  classNumber: string;
  isSuccess: boolean;
}

export interface IPaymentManagerAuthorizeRequest {
  customerId?: string | undefined;
  configurationSetCode?: string | undefined;
  total?: number;
  orderId?: string | undefined;
  billingAddress?: IPaymentAddress;
  shippingAddress?: IPaymentAddress;
  cardDetails?: IPaymentCardInformation;
  gatewayCurrencyCode?: string | undefined;
  gatewayType?: GatewayType;
  transactionId?: string | undefined;
  customerGatewayProfileId?: string | undefined;
  gatewayPaymentMethodToken?: string | undefined;
  gatewayAuthenticationToken?: string | undefined;
}

export interface IPaymentManagerPurchaseRequest {
  paymentMethodToken: string;
  total: number;
  gatewayCurrencyCode: string;
  orderId: string;
  billingAddress: IPaymentAddress;
}

export interface IPaymentManagerPurchaseResponse {
  transactionId?: string;
  externalTransactionId?: string;
  responseText?: string;
  responseCode?: string;
  isSuccess?: boolean;
}

export interface IPaymentManagerBankAccountRequest {
  firstName: string;
  lastName: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: string;
}

export interface IPaymentManagerBankAccountResponse {
  gatewayPaymentMethodToken?: string;
  isSuccess: boolean;
  responseText?: string;
}

export interface IPaymentManagerCaptureRequest {
  transactionId: string;
  orderId: string;
}

export interface IPayment {
  shippingAddress: IAddress;
  billingAddress: IAddress;
  paymentSetting: IPaymentSetting;
  paymentDisplayName: string;
  paymentName: string;
  isPreAuthorize: boolean;
  testMode: boolean;
  paymentExternalId: string;
  paymentStatusId: number;
  paymentApplicationSettingId?: number;
  customerProfileId?: string;
  customerPaymentId?: string;
  customerGuid?: string;
  paymentToken?: string;
  paypalReturnUrl?: string;
  paypalCancelUrl?: string;
  paymentType?: string;
  amazonPayReturnUrl?: string;
  amazonPayCancelUrl?: string;
  amazonOrderReferenceId?: string;
  cardType?: string;
  ccExpiration?: string;
  transactionId?: string;
  accountNumber?: string;
  shippingMethod?: string;
  customerShippingAddressId?: string;
  cardSecurityCode?: string;
  paymentCode?: string;
  isSaveCreditCard?: string;
  cyberSourceToken?: string;
  email?: string;
  cardHolderName?: string;
  paymentGUID?: string;
  gatewayCode?: string;
  paymentMethodNonce?: string;
  portalName?: string;
  isAnonymousUser?: boolean;
  cardDataToken?: string;
  cardExpirationYear?: string;
  cardExpirationMonth?: string;
}

export interface IPaymentSetting {
  transactionKey: string | undefined;
  gatewayPassword: string | undefined;
  gatewayUsername: string | undefined;
  paymentTypeId: number;
  paymentCode: string;
  paymentDisplayName: string;
  paymentSettingId: number;
  paymentTypeName: string;
  isApprovalRequired: boolean;
  isOABRequired?: boolean;
  purchaseOrderNumber?: string;
  portalPaymentGroupId?: number;
  displayOrder: number;
  isBillingAddressOptional?: boolean;
  gatewayCode?: string;
  paymentExternalId?: string;
  testMode?: boolean;
  preAuthorize?: boolean;
  profileId?: number;
  paymentGatewayId?: number;
  isPoDocRequire?: boolean;
  isPoDocUploadEnable?: boolean;
  isCallToPaymentAPI?: boolean;
}
export interface IBaseDropDownOptions {
  text?: string;
  value: string;
  id?: string;
  type?: string;
  status?: boolean;
  customStatus?: boolean;
  portalPaymentGroupId: number;
  isSelected: boolean;
}

export interface IUserPaymentSetting {
  userId: number;
  portalId: number;
}

export interface IConfigurationSetFields {
  key: string;
  value?: string;
  code?: string;
  displayName?: string;
  type: string;
  helpText?: string;
  sectionField?: string;
  childrenFields?: Array<IConfigurationSetField>;
  childrenCategorySelectionField?: string;
  childrenCategorySelectionBehavior?: string;
  childrenCategories?: Array<IConfigurationSetFields>;
}

export interface IConfigurationSetField {
  key: string;
  label: string;
  type: string;
  defaultValue?: string | number | boolean;
  isRequired: boolean;
  varyBy?: string;
  helpText?: string;
  value?: string;
  options?: Array<IConfigurationSetOption> | null;
}

export interface IConfigurationSetOption {
  key: string;
  value?: string;
  displayName: string;
}

export interface IConfigurationSetFields {
  key: string;
  value?: string;
  code?: string;
  displayName?: string;
  type: string;
  helpText?: string;
  sectionField?: string;
  childrenFields?: Array<IConfigurationSetField>;
  childrenCategorySelectionField?: string;
  childrenCategorySelectionBehavior?: string;
  childrenCategories?: Array<IConfigurationSetFields>;
}

export interface IConfigurationSetField {
  key: string;
  label: string;
  type: string;
  defaultValue?: string | number | boolean;
  isRequired: boolean;
  varyBy?: string;
  helpText?: string;
  value?: string;
  options?: Array<IConfigurationSetOption> | null;
}

export interface IConfigurationSetOption {
  key: string;
  value?: string;
  displayName: string;
}

export interface IFileUploadResponse {
  FileUpload: IFile[];
}

export interface IFile {
  FileName: string;
}

export interface IVoidRefundPaymentRequest {
  configurationSetCode: string;
  paymentTransactionToken: string;
  paymentStatusCode?: string;
}

export interface IUpdateOfflinePaymentResponseModel {
  classNumber: string;
  isSuccess: boolean;
}

export interface IVerifyPaymentRequest {
  customerId?: string | undefined;
  configurationSetCode: string;
  total: number;
  orderId: string;
  billingAddress: IPaymentAddress;
  shippingAddress?: IPaymentAddress;
  cardDetails?: ICardDetails;
  gatewayCurrencyCode: string;
  gatewayType: string;
  transactionId: string;
  customerGatewayProfileId: string;
  gatewayPaymentMethodToken: string;
  retainOnSuccess: boolean;
  isSaveCreditCard: boolean;
  customerGuid: string;
  isSavedPaymentMethod: boolean;
}

export interface ISavedCardDetailsResponse {
  creditCardDetails?: ICreditCardDetail[] | undefined;
}

export interface ICreditCardDetail {
    paymentCustomerInfoId?: string;
    cardType?: string | undefined;
    creditCardLastFourDigit?: string | undefined;
    gatewayPaymentMethodToken?: string | undefined;
}

export interface IBooleanResponse {
    isSuccess?: boolean;
}