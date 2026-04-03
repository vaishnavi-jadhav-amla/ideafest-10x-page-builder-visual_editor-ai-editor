import { IBase } from "./base";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ISliderBanners = { sliderBanners: Array<IBannerSlider>; commonSliderData?: Array<IBannerSlider> };

export interface ISliderBannerRoot {
  status: string;
  message: string;
  data: ISliderBanners;
}

export interface IBannerSlider extends IBase {
  commonSliderData?: IBannerWidget;
  sliderBanners?: ISlider[] | null;
}

export interface IBannerWidget {
  cmsWidgetSliderBannerId?: number;
  cmsSliderId?: number;
  type?: string;
  localeId?: number;
  enableCmsPreview?: boolean;
  localeCode?: string;
  storeCode?: string;
}

export interface ISlider {
  mediaId: number;
  title: string;
  imageAlternateText: string;
  buttonLabelName: string;
  buttonLink: string;
  textAlignment: string;
  description: string;
  mediaPath: string | null;
  bannerSequence: number;
}
