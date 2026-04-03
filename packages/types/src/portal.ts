import { UserVerificationTypeEnum, ZnodePublishStatesEnum } from "./enums";

import { IBase } from "./base";

export interface IBasePortal {
  localeId: number;
  portalId: number;
  publishCatalogId?: number;
  profileId?: number;
}
export interface IFilteredLoginPortalData {
  loginRequired: string;
}

export interface IPortalLocals {
  localeId: number;
  name: string;
  code: string;
  isActive: boolean;
  isDefault: boolean;
  custom1: null;
  custom2: null;
  custom3: null;
  custom4: null;
  custom5: null;
}

export interface IPortalDetail extends IBase {
  siteKey?: string;
  secretKey?: string;
  isCaptchaRequiredForLogin?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginToSeePricingAndInventory?: boolean;
  portalProfileCatalogId?: number;
  imageSmallThumbnailUrl?: string;
  mediaServerUrl?: string;
  imageMediumUrl?: string;
  imageSmallUrl?: string;
  imageLargeUrl?: string;
  mediaServerThumbnailUrl?: string;
  imageThumbnailUrl?: string;
  localeId: number;
  portalId: number;
  publishCatalogId: number;
  publishCatalogCode?: string;
  profileId?: number;
  enableAddressValidation?: boolean;
  pageList?: IPageList[];
  sortList?: ISortingOptions[];
  portalFeatureValues?: IPortalFeatureValues;
  defaultOrderStateId?: number;
  publishState?: ZnodePublishStatesEnum;
  publishStateName?: string;
  storeName?: string;
  name?: string;
  hostname?: string;
  portalLocales?: IPortalLocale[];
  cultureCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  enableSaveForLater?: boolean;
  globalAttributes?: IGlobalAttributeValues[];
  outOfStockMessage?: string;
  enableApprovalManagement?: boolean;
  productCompareType?: string;
  enableCompare?: boolean;
  customerServiceEmail?: string;
  isAddToCartOptionForProductSlidersEnabled?: boolean;
  websiteLogo?: string;
  customerServicePhoneNumber?: string;
  storeCode?: string;
  orderStatusId?: number;
  themeName?: string;
  parentThemeName?: string;
  orderStatus?: string;
  isActive?: boolean;
  isProductInheritanceEnabled?: boolean;
  defaultRobotTag?: string;
  portalThemeId?: number;
  websiteDescription?: string;
  faviconImage?: string;
  websiteTitle?: string;
  analyticsUId?: string;
  isEnabledAnalytics?: boolean;
  containerId?: string;
  isEnabledTagManager?: boolean;
  isEnabledEnhancedEcommerce?: boolean;
  isUserLoggedIn?: string;
  showDefaultAndAllLocationsInventory?: string;
  showShippingConstraints?: string;
  showPromotionSection?: string;
  analyticsIsActive?: boolean;
  enableEnhancedEcommerce?: boolean;
  enableQuoteRequest?: string;
  hostName?: string;
  userVerificationTypeCode?: UserVerificationTypeEnum;
  userVerificationTypeCodeValue?: number;
  localeCode?: string;
  portalProfileCatalogCode?: string;
  isBStore?: boolean;
  isBStoreRequestPage?: boolean;
  isAutoApproved?: boolean;
  bStoreDomainName?: string;
  isParentStoreEnable?: boolean;
  recommendationSetting?: IRecommendationSetting;
  catalogCode?: string;
  loginRequired?: boolean;
  redirectPageOnLogin?: string;
  trackingPixelScript?: string;
  trackingPixelScriptCode?: string;
  underMaintenance?: boolean;
  globalUnderMaintenance?: boolean;
  inStockMessage?: string;
  backOrderMessage?: string;
  userActivityEnabled?: boolean;
  isDomainActive?: boolean;
  enable2FAForStore?: boolean;
  isBStoreLoginRequired?: boolean;
  isUserAllowPurchase?: boolean;
  openDate?: Date;
  closeDate?: Date;
  isLinkActive?: boolean;
  isBStoreShowPricingAndInventory?: boolean;
  isBStoreAllowUserSelfRegister?: boolean;
  isBStoreCustomizedCatalog?: boolean;
  isBStoreApproved?: boolean;
  bStoreGlobalAttributes?: IBStoreGlobalAttributes;
}
export interface IRecommendationSetting {
  isHomeRecommendation?: boolean;
  isPDPRecommendation?: boolean;
  isCartRecommendation?: boolean;
}
export interface IPortalLocale extends IBase {
  localeId: number;
  name: string;
  code: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface ISortingOptions {
  sortDisplayName: string;
  displayOrder: string;
  sortValue: string;
}

export interface IFilteredPortalData {
  enableSocialMediaLogin: string;
  isCaptchaRequiredForLogin: string;
  siteKey: string;
  redirectPageOnLogin: string;
  loginRequiredAttribute: string;
  portalFeatureValues: IPortalFeatureValues;
}

export interface IPortalFeatureValues extends IBase {
  persistentCart?: boolean;
  enableProfileBasedSearch?: boolean;
  enableProductInheritance?: boolean;
  enableAddToCartOptionForProductSliders?: boolean;
  enableCMSPageResults?: boolean;
  enableBarcodeScanner?: boolean;
  enableVoiceBasedSearch?: boolean;
  enableTypeaheadSearchSettings?: boolean;
  enableHydratedSearchSettings?: boolean;
}

export interface IGlobalAttributeEntityDetails {
  attributes?: IGlobalAttributeValues[] | undefined;
  familyCode: string;
}

export interface IGlobalAttributeValues {
  userId?: number;
  globalEntityId?: number;
  entityName: string;
  entityValue: string;
  globalAttributeGroupId: string;
  globalAttributeId?: number;
  attributeTypeId: string;
  attributeTypeName: string;
  attributeCode?: string;
  isRequired?: boolean;
  isLocalizable?: boolean;
  attributeName: string;
  attributeValue: string;
  globalAttributeValueId: string;
  globalAttributeDefaultValueId: string;
}

export interface IPageList {
  isDefault: boolean;
  pageValue: number;
}

export interface IPortalApproval {
  portalApprovalModel?: IPortalApprovalDetails;
}

export interface IPortalApprovalDetails {
  portalApprovalId?: number;
  enableApprovalManagement?: boolean;
  portalApprovalTypeId?: number;
  portalApprovalLevelId?: number;
  portalApprovalLevelName?: string;
  orderLimit?: number;
  portalId?: number;
  approvalUserIds?: string[];
  userApprover?: IUserApproverModel[];
  paymentTypeIds?: string[];
  portalPaymentGroupId?: number;
  portalApprovalTypes?: [];
  portalApprovalLevel?: [];
  userId?: number;
  approverName?: string;
  approverUserId?: number;
  userApproverId?: number;
  approverUser?: string;
  portalApprovalTypeName?: string;
}

export interface IUserApproverModel {
  userApproverId?: number;
  userId?: number | undefined;
  approverLevelId?: number;
  portalPaymentGroupId?: number | undefined;
  approverUserId?: number;
  approverOrder?: number;
  isNotifyEmail?: boolean;
  isMandatory?: boolean;
  toBudgetAmount?: number | undefined;
  fromBudgetAmount?: number | undefined;
  omsOrderStateId?: number;
  omsQuoteId?: number;
  approverName?: string | undefined;
  omsOrderState?: string | undefined;
  approverLevelName?: string | undefined;
  statusModifiedDate?: Date | undefined;
  isNoLimit?: boolean | undefined;
  isActive?: boolean | undefined;
  portalApprovalId?: number | undefined;
  fullName?: string | undefined;
}

export interface ISchemaDetails {
  storeName?: string;
  websiteLogo?: string;
  customerServiceEmail?: string;
  customerServicePhoneNumber?: string;
}

export interface IBStoreGlobalAttributes  {
  Attributes?: IBStoreAttribute[] | undefined;
}

export interface IBStoreAttribute {
  AttributeValue?: string | undefined;
  AttributeCode?: string | undefined;
}
