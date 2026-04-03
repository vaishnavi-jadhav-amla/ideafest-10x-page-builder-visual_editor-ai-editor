import { IBrandsCarouselRenderProps } from "./BrandsCarouselConfig";
import { BrandsCarousel } from "@znode/base-components/znode-widget/brands-carousel";

export function BrandsCarouselRender(props: Readonly<IBrandsCarouselRenderProps>) {
  const { response, config: _c, id, puck: _p, ...swapperConfig } = props || {};

  if (!response?.data) return null;

  const brandData = response?.data || null;

  if (!brandData) return null;

  return <BrandsCarousel swapperConfig={swapperConfig} brandData={brandData} />;
}
