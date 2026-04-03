import { isEmpty } from "@znode/utils/common";
import { IOfferBannerRenderProps } from "./OfferBannerConfig";
import { OfferBanners } from "@znode/base-components/znode-widget/offer-banner";

export function OfferBannerWrapper(props: Readonly<IOfferBannerRenderProps>) {
  // ** Note: make sure you are extracting value for swapperConfig, swapperConfig should be exact as required in OfferBanners Component
  const { response, config:_c, id, puck: _p, ...swapperConfig } = props || {};

  if (!response?.data) {
    return null;
  }

  const offerBannerData = response.data || [];

  if (isEmpty(offerBannerData)) {
    return null;
  }

  return <OfferBanners swapperConfig={swapperConfig} offerBanners={offerBannerData} />;
}
