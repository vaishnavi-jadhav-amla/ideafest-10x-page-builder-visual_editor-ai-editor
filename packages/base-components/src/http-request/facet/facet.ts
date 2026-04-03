import { IFacets } from "@znode/types/facet";
import { httpRequest } from "../base";
interface IFacetParameter {
  searchTerm?: string;
  categoryCode?: string;
  brandCode?: string;
}
export const getProductFacet = async ({ searchTerm, categoryCode, brandCode }: IFacetParameter) => {
  const facetResponse = await httpRequest<IFacets[]>({ endpoint: "/api/get-product-facets", queryParams: { searchTerm, categoryCode, brandCode } });
  return facetResponse;
};
