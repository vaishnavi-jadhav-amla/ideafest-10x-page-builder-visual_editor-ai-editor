"use client";

import { IProductListPageConfig } from "./ProductListPageConfig";
import { ProductListPage } from "@znode/bstore/page-widgets/product-list-page";

export function ProductListPageRender(props: Readonly<IProductListPageConfig>) {
  const { response, displayFacets } = props || {};
  if (!response?.data) {
    return null;
  }

  const data = response?.data || {};

  const productsData = data?.productsData;
  const facetData = displayFacets ? data?.facetData : [];
  const breadCrumbsTitle = data?.breadCrumbsTitle;

  return <ProductListPage productsData={productsData} facetData={facetData} breadCrumbsTitle={breadCrumbsTitle} {...props} />;
}

export default ProductListPageRender;
