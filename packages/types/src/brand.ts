export interface IBrand {
  brandId: number;
  brandCode: string;
  brandName: string;
  mediaId: number | null;
  websiteLink: string | null;
  description: string | null;
  seoTitle: string | null;
  seoKeywords: string | null;
  seoDescription: string | null;
  seoFriendlyPageName: string | null;
  displayOrder: number;
  isActive: boolean;
  mediaPath: string;
  brandDetailLocaleId: number;
  cmsSeoDetailId: number;
  cmsSeoDetailLocaleId: number;
  localeId: number;
  portalId: number;
  imageLargePath: string;
  imageMediumPath: string;
  imageThumbNailPath: string;
  imageSmallPath: string;
  imageSmallThumbnailPath: string | null;
  originalImagePath: string;
  imageName: string | null;
}

export interface IBrandDetailResponse {
  brands: IBrand;
}

export interface IBrandDetail {
  typeOfMapping: string;
  cmsMappingId: number;
  properties: {
    brand: string;
  };
  brandCode: string;
}

export interface IWidgetBrand {
  brandId: number;
  brandCode: string;
  brandName: string;
  imageSmallPath: string;
  seoTitle: string;
  seoFriendlyPageName: string;
}
export interface IBrandList {
  brands: IWidgetBrand[];
}

