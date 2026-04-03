import { IConfigurableProduct, IProductDetails, IProductDetailsProps, IProductReview } from "@znode/types/product-details";

import AddToCartNotification from "../../add-to-cart-notification/AddToCartNotification";
import { BreadCrumbs } from "../../common/breadcrumb";
import { ISearchParams } from "@znode/types/search-params";
import LinkProducts from "../link-products/LinkProducts";
import ProductBasicInfo from "./product-information/ProductBasicInfo";
import ProductTabSection from "../product-details-tabs/ProductTabSection";
import RecentlyViewProduct from "../recently-view-product/RecentlyViewProduct";

async function ProductDetails({ product }: { product: IProductDetailsProps; searchParams: ISearchParams }) {
  const productData = product.productBasicDetails;

  return (
    <div>
      <BreadCrumbs
        znodeCategoryIds={productData?.znodeCategoryIds}
        name={productData?.name}
        isParentCategory={true}
        combinationErrorMessage={productData?.configurableData?.combinationErrorMessage}
        parentConfigurableProductName={productData?.parentConfigurableProductName}
      />
      <ProductBasicInfo productData={product.productBasicDetails as IProductDetails} configurableProducts={product.configurableProducts as IConfigurableProduct[]} />
      <ProductTabSection
        tabList={product?.tabList || []}
        productReviews={productData?.productReviews as IProductReview[]}
        name={productData?.name || ""}
        sku={productData?.sku || ""}
        productId={productData?.publishProductId}
      />
      <LinkProducts productSku={productData?.sku} productId={productData?.publishProductId} />
      <AddToCartNotification />
      <RecentlyViewProduct productData={product.productBasicDetails as IProductDetails} />
    </div>
  );
}

export default ProductDetails;
