export interface IWidget {
  brandCode?:string;
  customImageClass?: string;
  cmsMappingId?: number;
  localeId: number; // mandatory for portal data
  portalId: number; // mandatory for portal data
  localeCode?: string;
  storeCode?: string
  widgetCode: string;
  widgetKey: string;
  typeOfMapping: string;
  displayName?: string;
  profileId?: number;
  publishCatalogId?: number | undefined;
  widgetName?: string;
  contentOrientation?: "horizontal" | "vertical";
  customClass?: string;
  isFont?: boolean;
  properties?: { [key: string]: string };
  isNonConfigurable?: boolean;
  publishState?: number;
  catalogCode?: string;
}

export interface ILinkData {
  title: string;
  imageThumbnailUrl: string;
  url: string;
  mediaPath: string;
  isNewTab: boolean;
}

export interface IWidgetLink extends IBaseWidget {
  localeId: number;
  portalId: number;
  cmsMappingId: number;
  contentOrientation?: "horizontal" | "vertical";
  customClass?: string;
  isFont?: boolean;
  customImageClass?: string;
}

export interface IBaseWidget {
  widgetCode: string;
  widgetKey: string;
  typeOfMapping: string;
  widgetName?: string;
  displayName?: string;
  cmsMappingId?: number;
}
