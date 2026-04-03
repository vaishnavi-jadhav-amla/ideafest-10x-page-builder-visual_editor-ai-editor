import { IConfigurableProduct, IProductDetails, IProductDetailsProps, IProductReview } from "@znode/types/product-details";

import AddToCartNotification from "@znode/base-components/components/add-to-cart-notification/AddToCartNotification";
import LinkProducts from "@znode/base-components/components/product/link-products/LinkProducts";
import { Modal } from "@znode/base-components/components/common/modal";
import ProductAnalytics from "@znode/base-components/components/product/product-details/product-analytics/ProductAnalytics";
import { ProductBasicInfo } from "../../../product/product-basic-info";
import ProductTabSection from "@znode/base-components/components/product/product-details-tabs/ProductTabSection";
import QuickViewDetails from "@znode/base-components/components/common/product-card/quick-view/QuickViewDetails";
import RecentlyViewProduct from "@znode/base-components/components/product/recently-view-product/RecentlyViewProduct";

export function ProductDetailsPage({ product }: { product: IProductDetailsProps }) {
  const productData = product.productBasicDetails;
  const combinationErrorMessage = productData?.configurableData?.combinationErrorMessage;
  return (
    <div>
      <ProductBasicInfo productData={product.productBasicDetails as IProductDetails} configurableProducts={product.configurableProducts as IConfigurableProduct[]} />
      {product && product.productBasicDetails && <ProductAnalytics productData={product.productBasicDetails as IProductDetails} />}
      {!combinationErrorMessage && (
        <ProductTabSection
          tabList={product?.tabList || []}
          productReviews={productData?.productReviews as IProductReview[]}
          name={productData?.name || ""}
          sku={productData?.sku || ""}
          productId={productData?.publishProductId}
        />
      )}

      <LinkProducts productSku={productData?.sku} productId={productData?.publishProductId} />
      <AddToCartNotification />
      <RecentlyViewProduct productData={product.productBasicDetails as IProductDetails} />
      <Modal size="5xl" modalId="QuickView" maxHeight="lg" customClass="overflow-y-auto no-print">
        <QuickViewDetails />
        <AddToCartNotification />
      </Modal>
    </div>
  );
}
