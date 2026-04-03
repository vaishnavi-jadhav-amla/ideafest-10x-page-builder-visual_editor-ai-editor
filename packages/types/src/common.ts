import { IMegaMenuCategory } from "./category";
import { IPortalLocale } from "./portal";

export interface ICountry {
  countryName: string;
  countryId: number;
  countryCode: string;
  isDefault: boolean;
}

export interface IState {
  stateName: string;
  stateCode: string;
  stateId: number;
  isDefault: boolean;
}

export interface IAnalytics {
  containerId: string;
  analyticsUId: string;
  isEnabledTagManager: boolean;
  isEnabledAnalytics: boolean;
  isEnabledEnhancedEcommerce: boolean;
  trackingPixelScript: string
}


export interface ICommonHeaderDetails {
  categories: IMegaMenuCategory [];
  isUserLoggedIn: boolean;
  portalLocales: IPortalLocale [];
  analyticsInfo: IAnalytics;
  cartCount: number;
}

export interface IRecaptcha {
  secretKey: string;
  siteKey: string;
}

export interface ICheckoutRecaptcha extends IRecaptcha {
  isRecaptchaRequiredForCheckout: boolean;
}

export interface ILoginRecaptcha extends IRecaptcha {
  isCaptchaRequiredForLogin: boolean | undefined;
}

export interface INewsLetter {
  email: string;
}

export interface INewsLetterResponse {
  errorMessage?: string;
  isSuccess: boolean;
}

export interface IPortalProperties {
  localeId?: number;
  portalId: number;
  loginToSeePricingAndInventory?: string;
  currencyCode?: string;
  publishCatalogId?: number;
  profileId?: number;
  imageSmallUrl?: string;
}

export interface IImageProp {
  seoTitle: string;
  imageLargePath: string;
  dataTestSelector: string;
  cssClass?: string;
  parentCSS?: string;
  width?: number;
  height?: number;
  noLoad?: boolean;
}

export interface ISearchUrl {
  returnUrl?: string;
}

export interface IAgentError {
  hasError: boolean;
  message: string;
}

export interface ICaptcha {
  isCaptchaRequired:string;
  siteKey:string;
  secretKey:string;
}