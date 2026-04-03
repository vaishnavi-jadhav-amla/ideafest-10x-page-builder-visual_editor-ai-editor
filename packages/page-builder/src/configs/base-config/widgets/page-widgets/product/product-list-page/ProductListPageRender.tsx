"use client";

import AddToCartNotification from "@znode/base-components/components/add-to-cart-notification/AddToCartNotification";
import { CategoryProductList } from "@znode/base-components/page-widget/category-product-list";
import { IProductListPageConfig } from "./ProductListPageConfig";
import { Modal } from "@znode/base-components/common/modal";
import ProductComparePopup from "@znode/base-components/components/product/compare-product/compare-product-popup/CompareProductPopUp";


export function ProductListPageRender(props: Readonly<IProductListPageConfig>) {
  const { response, displayFacets } = props || {};
  if (!response?.data) {
    return null;
  }

  const data = response?.data || {};

  const productsData = data?.productsData;
  const facetData = displayFacets ? data?.facetData : [];
  const breadCrumbsTitle = data?.breadCrumbsTitle;

  return (
    <>
      <CategoryProductList
        isEnableCompare={data.isEnableCompare}
        productsData={productsData}
        facetData={facetData}
        breadCrumbsTitle={breadCrumbsTitle}
        showWishlist={true}
        {...props}
      />
      <Modal size="5xl" modalId="ProductCompare" maxHeight="lg" customClass="overflow-y-auto no-print p-3" noDefaultClass="m-0 p-0">
        <ProductComparePopup />
      </Modal>
      <AddToCartNotification />
    </>
  );
}

export default ProductListPageRender;
