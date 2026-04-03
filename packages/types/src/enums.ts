/* eslint-disable no-unused-vars */
export enum ApplicationTypesEnum {
  Admin = 0,
  API = 1,
  WebStore = 2,
  WebstorePreview = 3,
}

export enum ZnodePublishStatesEnum {
  NotPublished = 1,
  Draft = 2,
  Production = 3,
  Preview = 4,
  PublishFailed = 5,
  Processing = 6,
}
export enum ResetPasswordStatusEnum {
  Continue = 2001,
  LinkExpired = 2002,
  TokenMismatch = 2003,
  NoRecord = 2004,
}

export enum TypeAheadEnum {
  EligibleReturnOrderNumberList,
}

export enum ShippingConstraints {
  ShipComplete = "ShipComplete",
  ShipPartial = "ShipPartial",
}

export enum TypeAheadTypeNameEnum {
  EligibleReturnOrderNumberList,
  ReturnOrders,
}

export enum UserVerificationTypeEnum {
  NoVerificationCode = 0,
  EmailVerificationCode = 1,
  AdminApprovalCode = 2,
  None = 3,
}
export enum VoucherCard {
  IsActive = 1,
}

export enum QuotesEnum {
  OmsQuoteTypeId = 3,
}

export enum SortEnum {
  NameAToZ = 5,
  NameZToA = 6,
  PriceHighToLow = 3,
  PriceLowToHigh = 4,
  HighestRating = 1,
  MostReviewed = 2,
  OutOfStock = 7,
  InStock = 8,
  ExpirationDate = 9,
  SortbyPopular = 10
}

export enum ForgotPasswordEnum {
  AccountLocked = 1004,
  TwoAttemptsToAccountLocked = 1008,
  OneAttemptToAccountLocked = 1009,
  LockOutEnabled = 1010,
  LoginFailed = 1003,
  AdminApproval = 9001,
  InvalidData = 5,
  InvalidUserNamePassword = 7,
}

export enum FilterCollection {
  Contains = "cn",
  Is = "is",
  StartsWith = "sw",
  EndsWith = "ew",
  Between = "bw",
  GreaterThan = "gt",
  LessThan = "lt",
  GreaterThanOrEqual = "ge",
  LessThanOrEqual = "le",
  NotEquals = "ne",
  Equals = "eq",
  Like = "lk",
  In = "in",
  NotIn = "not in",
  NotContains = "ncn",
}

export enum ZnodeCartItemErrorCode {
  OutOfStock = 259,
}

export enum ZnodePaymentStatus {
  AUTHORIZED,
  CAPTURED,
  DECLINED,
  REFUNDED,
  VOIDED,
  PENDING,
  PENDINGFORREVIEW,
}

export enum GatewayType {
  _0 = 0,
  _1 = 1,
  _2 = 2,
  _3 = 3,
  _4 = 4,
  _5 = 5,
  _6 = 6,
  _7 = 7,
  _8 = 8,
  _9 = 9,
  _10 = 10,
}

export enum ErrorCodes {
  MigrationFailed= "6000",
  StoreNotPublished = "6001",
  StoreDataNotFound = "6002",
  ThemeNotFound = "6003",
  InvalidStoreCode = "6004",
  PreviewUrlNotPublished = "6005",
  DomainNotFound = "6006",
  DomainInActive = "6007",
}
