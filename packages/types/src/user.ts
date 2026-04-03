import { IAccountUser } from "./account";
import { IAddress } from "./address";
import { IGlobalAttributeValues } from "./portal";
import { IOrdersList } from "./account/order";
import { IShoppingCart } from "./shopping";
import { UserVerificationTypeEnum } from "./enums";

export interface IRegisterUserRequest {
  emailOptIn: boolean;
  userName: string;
  password?: string;
  email?: string;
  retypePassword?: string;
  baseUrl: string;
  hasError?: boolean;
}

export interface IUserSession {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  firstName?: string | null;
  accountId?: number | null;
  roleName?: string;
}

export interface IUserAddressList {
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
}

export interface IUser {
  permissionCode?: string;
  budgetAmount?: number;
  hasError?: boolean;
  errorMessage?: string;
  addressList?: IUserAddressList; // Changed to an array of addresses
  isAdminUser?: boolean;
  roleName?: string;
  portalId?: number;
  baseUrl?: string;
  userName?: string;
  fullName?: string;
  roleId?: string;
  externalId?: string;
  crsName?: string;
  token?: string;
  userId?: number;
  accountId?: number;
  accountCode?: string;
  username?: string;
  password?: string;
  aspNetUserId?: string;
  email?: string;
  firstName?: string;
  phoneNumber?: string;
  profiles?: IProfile[];
  wishList?: IWishListModel[];
  profileId?: number;
  publishCatalogId?: number;
  rememberMe?: boolean;
  lastName?: string;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  isTaxExempt?: boolean;
  storeCode?: string;
  publishCatalogCode?: string;
  catalogCode?: string;
  accountName?: string;
  loginTime?: string;
  isUserLevelApprovalEnabled?: boolean;
  userLevelApprovalOrderLimit?: number;
  crsUserId?: number | null;
  isMultiFactorAuthenticationEnabled?: boolean;
  isMultiFactorAuthenticated?: boolean;
}

export interface IProfile {
  profileId: number;
  profileName: string;
  publishCatalogId: number;
  addressList?: IAddress[]; // Changed to an array of addresses
  orderList?: IOrdersList[];
  isDefault?: boolean;
  publishCatalogCode?: string;
  catalogCode?: string;
}

export interface ISignUp {
  username: string;
  email: string;
  password?: string;
  newPassword?: string;
  passwordToken?: string;
  crsName?: string;
  emailOptIn?: boolean;
}

export interface IChangePassword {
  portalId?: number;
  userName?: string;
  password?: string;
  hasError?: boolean;
  newPassword?: string;
  reTypeNewPassword?: string;
  isResetPassword?: boolean;
  passwordToken?: string;
  oldPassword?: string;
  currentPassword?: string;
  errorMessage?: string;
}

export interface ILoginUser {
  createdBy?: number;
  createdDate?: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
  actionMode?: string;
  custom1?: string;
  custom2?: string;
  custom3?: string;
  userId?: number;
  aspNetUserId?: string;
  aspNetZnodeUserId?: string;
  email?: string;
  storeCode?: string;
  baseUrl?: string;
  userName?: string;
  fullName?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  loginName?: string;
  isEmailSentFailed?: boolean;
  user?: IUserInformation | null;
  roleId?: string;
  roleName?: string;
  portalId?: number;
  isLock?: boolean;
  profileId?: number;
  companyName?: string;
  emailOptIn?: boolean;
  sMSOptIn?: boolean;
  externalId?: string;
  accountname?: string;
  accountCode?: string;
  storeName?: string;
  permissionsName?: string;
  departmentName?: string;
  departmentId?: number;
  accountId?: number;
  accountPermissionAccessId?: number;
  departmentUserId?: number;
  portalIds?: string[];
  approvalUserId?: number;
  permissionCode?: string;
  budgetAmount?: number;
  approverName?: string;
  accountUserOrderApprovalId?: number;
  accountUserPermissionId?: number;
  customerPaymentGUID?: string;
  isAdminUser?: boolean;
  isGuestUser?: boolean;
  isWebStoreUser?: boolean;
  referralUserId?: number;
  localeId?: number;
  quoteApproverUserId?: number;
  isSocialLogin?: boolean;
  shippingPostalCode?: string;
  billingPostalCode?: string;
  countryName?: string;
  stateName?: string;
  cityName?: string;
  postalCode?: string;
  publishCatalogId?: number;
  custom4?: string;
  custom5?: string;
  perOrderLimit?: number;
  annualOrderLimit?: number;
  annualBalanceOrderAmount?: number;
  billingAccountNumber?: string;
  salesRepId?: number;
  salesRepUserName?: string;
  salesRepFullName?: string;
  userVerificationTypeCode?: UserVerificationTypeEnum;
  userVerificationType?: string;
  isVerified?: boolean;
  mediaId?: number;
  mediaPath?: string;
  businessIdentificationNumber?: string;
  isInvalidCredential?: boolean;
  isTradeCentricUser?: boolean;
  isChangePasswordFromProfile?: boolean;
  isBStoreManager?: boolean;
  isBStoreOwner?: boolean;
  isBStoreAvailable?: boolean;
  token?: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: Date;
  oldRefreshToken?: string;
  errorMessage?: string;
  hasError?: boolean;
  errorCode?: number;
  errorDetails?: IUserSignUpErrorDetails;
  isMultiFactorAuthenticationEnabled?: boolean;
}

export interface IUserSignUpErrorDetails {
  defaultStoreName?: string;
  forgotPasswordURL?: string;
}

export interface IUserSignUp {
  portalId: number;
  userVerificationTypeCode: UserVerificationTypeEnum;
  globalAttributes: IGlobalAttributeValues[];
  storeCode: string;
}
export interface IPermissions {
  enablePreviousPurchases: boolean;
  enableQuoteRequest?: boolean;
  enableReturnOrderRequest?: boolean;
}

export interface IWishListModel {
  userId?: number;
  portalId?: number;
  userWishListId?: number;
  sku?: string;
  wishListAddedDate?: Date;
  addOnProductSKUs?: string;
}

export interface IUserInformation {
  comment?: string;
  email?: string;
  newPassword?: string;
  password?: string;
  providerName?: string;
  username?: string;
  passwordToken?: string;
  roleName?: string;
  isApproved?: boolean;
  isLockedOut?: boolean;
  isOnline?: boolean;
  rememberMe?: boolean;
  isConfirmed?: boolean;
  createDate?: Date;
  lastActivityDate?: Date;
  lastLockoutDate?: Date;
  lastLoginDate?: Date;
  lastPasswordChangedDate?: Date;
  userId?: string;
  roleId?: string;
}

export interface AttributesSelectValuesModel {
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
  value?: string;
  code?: string;
  displayOrder?: number;
  swatchText?: string;
  path?: string;
  variantDisplayOrder?: number;
  variantImagePath?: string;
  variantSKU?: string;
}

export interface IUserAddressModel {
  addressId?: number;
  accountId?: number;
  address1?: string;
  address2?: string;
  address3?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  countryName?: string;
  stateName?: string;
  cityName?: string;
  stateCode?: string;
  postalCode?: string;
  phoneNumber?: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  isActive?: boolean;
  isGuest?: boolean;
  isShipping?: boolean;
  isBilling?: boolean;
  isShippingBillingDifferent?: boolean;
  fromBillingShipping?: string;
  accountAddressId?: number;
  warehouseId?: number;
  userId?: number;
  aspNetUserId?: string;
  userAddressId?: number;
  mobilenumber?: string;
  alternateMobileNumber?: string;
  faxNumber?: string;
  warehouseName?: string;
  emailAddress?: string;
  lTLAccountNumber?: string;
  isUseWareHouseAddress?: boolean;
  portalId?: number;
  externalId?: string;
  companyName?: string;
  countryCode?: string;
  dontAddUpdateAddress?: boolean;
  omsOrderId?: number;
  omsOrderShipmentId?: number;
  publishStateId?: number;
  isAddressBook?: boolean;
  gatewayCode?: string;
}

export interface ILogin {
  user: IUserRequestDetail;
  portalId: number;
}

export interface IUserRequestDetail {
  username: string;
  password: string;
}

export interface IPasswordResponse {
  hasError: boolean;
  errorMessage: string;
}

export interface IUserProfileResponseModel {
  hasError: boolean;
  userDetails: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    emailOptIn: boolean;
    smsOptIn: boolean;
  };
}

export interface IUpdateAddressResponse {
  status?: boolean;
  error?: string | null;
  addressType: string;
  addressModel: IAddress;
  successMessage: string;
  cartModelResponseData?: IShoppingCart;
}

export interface IGuestUserDetails {
  guestUserId: number;
  shippingAddressId: number;
  billingAddressId: number;
  billingAddress?: IAddress;
}

export interface IAnonymousUserAddressRequest {
  address?: IAddress;
  shippingAddress?: IAddress;
  billingAddress?: IAddress;
  isBothBillingShipping: boolean;
}

export interface IAnonymousUserAddressResponse {
  shippingAddressId?: number;
  billingAddressId?: number;
  billingAddress?: IAddress;
  hasError: boolean;
}

export interface ICustomerAccountList {
  sortValue: { [key: string]: string[] };
  pageIndex: number;
  pageSize: number;
  currentFilters?: IFilterType[];
  accountId?: number;
  userId?: number;
  userName?: string;
}

export interface IFilterType {
  key: string;
  value: string;
  type: string;
  columns: { status: string; date?: string };
}

export interface IAccountUserList {
  data: IAccountUserUserResponse;
  message: string;
  status: string;
  hasError?: boolean;
}

export interface IAccountUserUserResponse {
  users: IAccountUser[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
}
export interface IUserDetailResponse {
  userId?: number;
  aspNetUserId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  isActive?: boolean;
  externalId?: string;
  userName?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  customerPaymentGUID?: string;
  userVerificationType?: string;
  isGuestUser?: boolean;
  errorCode?: number;
}

export interface IMergeCartRequest {
  guestUserCartNumber: string;
  loginUserCartNumber?: string;
}

export interface IMergeCartResponse {
  mergedCartNumber: string | undefined;
  cartCount: number;
}

export interface IResetPasswordStatusResponse {
  statusCode: number;
}

export interface IUserAccountList {
  accountName: string;
  accountId: number;
  type: string;
}
export interface IUserAccountListResponse {
  accountList: IUserAccountList[];
  totalResults: number;
}

export interface IMultiFactorFormData {
  otp: string;
  username?: string;
  portalId?: string;
  isRememberDevice?: boolean;
  userId?: string;
}

export interface IMultiFactorAuthenticationResponse {
  isValid?: boolean;
  message?: string | undefined;
  isExpired?: boolean;
  remainingAttempts?: number;
  expiresAt?: Date | undefined;
  isOtpEmailSent?: boolean;
  remainingSeconds?: number;
  otpExpirationTime?: Date | undefined;
  otpGenerationTime?: Date | undefined;
  logoUrl?: string;
  storeCode?: string;
  hasError?: boolean;
  enableCartRedirection?: boolean;
  hideRemainingAttemptsFlag?: boolean;
}

export interface IValidateMultiFactorAuthenticationResponse {
  isValid: boolean;
  message?: string;
  isExpired?: boolean;
  remainingAttempts: number;
  otpExpirationTime?: Date;
  isOtpEmailSent?: boolean;
  expiresAt?: Date;
  errorMessage?: string;
  hasError?: boolean;
  errorCode?: number;
}

export interface IGenerateMultiFactorAuthenticationRequest {
  userId: string;
  portalId?: number;
  email: string;
  isResendMail: boolean;
}
