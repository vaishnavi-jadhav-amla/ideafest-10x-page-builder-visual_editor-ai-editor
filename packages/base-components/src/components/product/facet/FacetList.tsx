"use client";
import { IFacets } from "@znode/types/facet";
import { Facet } from "./Facet";
import { ICategory } from "@znode/types/category";
import { SearchResultCategoryList } from "./SearchResultCategoryList";
import { useUpdateFacet } from "./useUpdateFacet";
interface IFacetTerm {
  categoryCode?: string;
  brandCode?: string;
  searchTerm?: string;
}
export function FacetList({
  facetData,
  showCategory,
  ...rest
}: Readonly<{ facetData: IFacets[]; associatedCategoryList?: ICategory[]; pageSize?: number | null; facetTerm: IFacetTerm; showCategory?: boolean }>) {
  useUpdateFacet(facetData);
  return (
    <>
      {showCategory && <SearchResultCategoryList {...rest} />}
      {facetData?.length > 0 && <Facet facetData={facetData} {...rest} />}
    </>
  );
}
