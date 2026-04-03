import { ProductDetailsPage } from "@znode/base-components/page-widget/product-details-page";
import { IProductDetailsPageRenderProps } from "./ProductDetailsPageConfig";



export function ProductDetailsPageRender(props: Readonly<IProductDetailsPageRenderProps>) {
  const { response } = props || {};
  if (!response?.data) {
    return null;
  }

  const data = response?.data || {};
   
  const productDetails = data;

  return (
    <>
      <ProductDetailsPage product={productDetails} />
      
    </>
  );
}
