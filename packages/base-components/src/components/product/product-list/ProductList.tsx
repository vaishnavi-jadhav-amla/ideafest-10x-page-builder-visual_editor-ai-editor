import AddToCartNotification from "../../add-to-cart-notification/AddToCartNotification";
import { DynamicPagination } from "../../common/pagination";
import { IProductList } from "@znode/types/product";
import { Modal } from "../../common/modal";
import ProductComparePopup from "../compare-product/compare-product-popup/CompareProductPopUp";
import { ProductViews } from "./product-views";
interface IProductListProps {
  productData: IProductList;
  isFromSearch?: boolean;
  isEnableCompare?: boolean;
  breadCrumbsDetails?: { breadCrumbsTitle: string; isCategoryFlow: boolean };
}
export function ProductList(props: Readonly<IProductListProps>) {
  const { productData, isFromSearch, isEnableCompare, breadCrumbsDetails, ...rest } = props || {};
  const { totalProducts = 0, pageList = [], pageSize } = productData || {};
  return (
    <>
      <ProductViews isEnableCompare={isEnableCompare} productData={productData} isFromSearch={isFromSearch} {...rest} breadCrumbsDetails={breadCrumbsDetails} />
      <DynamicPagination totalProducts={totalProducts} pageList={pageList} pageSize={pageSize} isProductsPagination={true} />
      <Modal size="5xl" modalId="ProductCompare" maxHeight="lg" customClass="overflow-y-auto no-print p-3" noDefaultClass="m-0 p-0">
        <ProductComparePopup />
      </Modal>
      <AddToCartNotification />
    </>
  );
}
