export interface IOfferBanner {
  buttonLink: string;
  description: string;
  mediaPath: string;
  title: string;

}

export type IOfferBanners = Array<IOfferBanner>;

export interface IOfferBannerRoot {
  status: string;
  message: string;
  data: IOfferBanners;
}
