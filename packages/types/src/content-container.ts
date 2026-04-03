export interface IContentContainerBase {
  message: string;
  status: string;
}

// ** START AD-SPACE **
export interface IAdSpace {
  id: string;
  image: string;
  title?: string;
  text?: string;
  ctaLink?: string;
  index?: number;
}

export type IAdSpaces = Array<IAdSpace>;

export interface IAdSpaceResponseRoot extends IContentContainerBase {
  data: IAdSpaces;
}
// ** END OF AD-SPACE **

// ** START HOMEPAGE-PROMO **
export interface IHomePagePromo {
  containerKey: string;
  largeImageUrl: string;
  smallImageUrl: string;
  homePageTitle: string;
  ctaLink: string;
  ctaText: string;
}

export interface IHomePagePromoResponseRoot extends IContentContainerBase {
  data: IHomePagePromo;
}
// ** END OF HOMEPAGE-PROMO **

// ** START HOMEPAGE-TICKER **
export interface IHomePageTicker {
  title: string;
}

export interface IHomePageTickerResponseRoot extends IContentContainerBase {
  data: IHomePageTicker;
}
// ** END HOMEPAGE-TICKER **

export type IContentContainer = IHomePageTicker | IHomePagePromo | IAdSpaces;

export interface IContentContainerResponseRoot {
  localeId: number;
  cmsContentContainerId: number;
  cmsContainerTemplateId: number;
  contentContainerName: string;
  familyId: number;
  cmsContainerProfileVariantId: number;
  attributes: Attribute[];
}

export interface Attribute {
  selectValues: unknown[];
  globalAttributeGroupId: number;
  globalAttributeId: number;
  attributeTypeId: number;
  attributeTypeName: string;
  attributeCode: string;
  isRequired: boolean;
  isLocalizable: boolean;
  attributeName: string;
  attributeValue: string;
  globalAttributeValueId: string;
  globalAttributeDefaultValueId: string;
  attributeDefaultValueCode: string;
  attributeDefaultValue: string;
  isEditable: boolean;
  helpDescription: string;
}
