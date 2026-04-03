import dynamic from "next/dynamic";
import { IConfigurableProduct, IProductDetails, IProductDetailsProps, IProductReview } from "@znode/types/product-details";
import AddToCartNotification from "../../add-to-cart-notification/AddToCartNotification";
import { BreadCrumbs } from "../../common/breadcrumb";
import { Modal } from "../../common/modal";
import ProductAnalytics from "../../product/product-details/product-analytics/ProductAnalytics";
import ProductBasicInfo from "../../product/product-details/product-information/ProductBasicInfo";
import QuickViewDetails from "../../common/product-card/quick-view/QuickViewDetails";
import RecentlyViewProduct from "../../product/recently-view-product/RecentlyViewProduct";
//nx-ignore-next-line
const ProductTabSection = dynamic(() => import("../../product/product-details-tabs/ProductTabSection").then((mod) => mod.default), { ssr: false});
//nx-ignore-next-line
const LinkProducts = dynamic(() => import("../../product/link-products/LinkProducts").then((mod) => mod.default), { ssr: false});


export function ProductDetailsPage({ product }: { product: IProductDetailsProps }) {
  const productData = product.productBasicDetails;
  const combinationErrorMessage = productData?.configurableData?.combinationErrorMessage;
  const showLinkProduct = (productData?.youMayAlsoLike != "" || productData?.frequentlyBought != "" || productData.replacementProductSuggestions != "") ? true : false;
  return (
    <div>
      <BreadCrumbs
        znodeCategoryIds={productData?.znodeCategoryIds}
        name={productData?.name}
        isParentCategory={true}
        combinationErrorMessage={productData?.configurableData?.combinationErrorMessage}
        parentConfigurableProductName={productData?.parentConfigurableProductName}
        breadCrumbsTitle={productData?.breadCrumbTitle}
      />
      <ProductBasicInfo
        breadCrumbsTitle={productData?.breadCrumbTitle}
        productData={product.productBasicDetails as IProductDetails}
        configurableProducts={product.configurableProducts as IConfigurableProduct[]}
      />
      {product && product.productBasicDetails && <ProductAnalytics productData={product.productBasicDetails as IProductDetails} />}
      {!combinationErrorMessage && (
        <ProductTabSection
          tabList={product?.tabList || []}
          productReviews={productData?.productReviews as IProductReview[]}
          name={productData?.name || ""}
          sku={productData?.sku || ""}
          productId={productData?.configurableProductId || productData?.publishProductId}
        />
      )}
      {showLinkProduct && <LinkProducts productSku={productData?.sku} productId={productData?.publishProductId} />}
      <AddToCartNotification />
      <RecentlyViewProduct productData={product.productBasicDetails as IProductDetails} />
      <Modal size="5xl" modalId="QuickView" maxHeight="lg" customClass="overflow-y-auto no-print">
        <QuickViewDetails />
        <AddToCartNotification />
      </Modal>
    </div>
  );
}
