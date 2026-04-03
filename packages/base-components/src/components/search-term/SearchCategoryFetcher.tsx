"use client";
import { CompareProductList } from "../product";
import { FacetList } from "../product/facet";
import { ISearchTerm } from "@znode/types/search-term";
import { ProductList } from "../product/product-list";
import { useParams } from "next/navigation";
interface ISearchCategoryFetcher {
  searchResult: ISearchTerm;
  showWishlist?: boolean;
}

export function SearchCategoryFetcher({ searchResult, ...rest }: ISearchCategoryFetcher) {
  const { filteredProductData, filteredAttribute, isEnableCompare } = searchResult || {};
  const { searchTerm } = useParams();
  const isProductFound = filteredProductData?.totalProducts > 0;
  return (
    <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {isProductFound && (
        <div className="col-span-4 lg:col-span-1">
          <FacetList facetData={filteredAttribute} pageSize={filteredProductData?.pageSize} facetTerm={{ searchTerm: searchTerm?.toString() || "" }} showCategory />
          {isEnableCompare && <CompareProductList />}
        </div>
      )}
      <div id="product-container" className="col-span-4">
        <ProductList productData={filteredProductData} isFromSearch={true} isEnableCompare={isEnableCompare} {...rest} />
      </div>
    </div>
  );
}
