import { IBannerSlider, ISliderBanners } from "@znode/types/slider-banner";

import { Banners } from "@znode/base-components/znode-widget/banner";
import { IBannerSliderRenderProps } from "./BannerSliderConfig";

export function BannerSliderWrapper(props: Readonly<IBannerSliderRenderProps>) {
  const { response, id, puck: _p, config: _c, ...carouselConfig } = props || {};

  if (!response?.data) {
    return null;
  }
  
  const bannerSlider : ISliderBanners = response?.data || [];
  // *** Note: make sure you are passing carouselConfig as expected
  return <Banners key={id} bannerSlider={bannerSlider as IBannerSlider} carouselConfig={carouselConfig} />;
}
