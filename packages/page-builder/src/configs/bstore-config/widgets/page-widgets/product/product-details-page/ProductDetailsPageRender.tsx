import { IProductDetailsPageRenderProps } from "./ProductDetailsPageConfig";
import { ProductDetailsPage } from "@znode/bstore/page-widgets/product-details-page";

export function ProductDetailsPageRender(props: Readonly<IProductDetailsPageRenderProps>) {
  const { response } = props || {};
  if (!response?.data) {
    return null;
  }

  const data = response?.data || {};

  const productDetails = data;
  return <ProductDetailsPage product={productDetails} />;
}
