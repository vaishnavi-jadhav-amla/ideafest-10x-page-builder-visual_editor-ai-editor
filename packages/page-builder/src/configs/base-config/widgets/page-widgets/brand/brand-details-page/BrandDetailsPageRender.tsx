import { BrandDetails } from "@znode/base-components/page-widget/brand-details";
import { IBrandDetailsPageRenderProps } from "./BrandDetailsPageConfig";

export function BrandDetailsPageRender(props: IBrandDetailsPageRenderProps) {
  if (!props.response || !props.response.data) {
    return null;
  }

  const brandData = props.response.data?.brands || {};

  return <BrandDetails brandData={brandData} showWishlist={true} />;
}
