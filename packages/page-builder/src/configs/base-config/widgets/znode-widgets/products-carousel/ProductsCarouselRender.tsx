import { IProductsCarouselRenderProps } from "./ProductsCarouselConfig";
import { ProductsCarousel } from "@znode/base-components/znode-widget/products-carousel";

export function ProductsCarouselRender(props: Readonly<IProductsCarouselRenderProps>) {
  const { response, config: _c, id, puck: _p, ...swapperConfig } = props || {};

  if (!response?.data) return null;

  const productData = response?.data || null;

  if (!productData) return null;

  return <ProductsCarousel swapperConfig={swapperConfig} productData={productData} />;
}
