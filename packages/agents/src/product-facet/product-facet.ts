import { ProductFacet_productFacet } from "@znode/clients/v2";
import { getPortalDetails } from "../portal";
import { getCatalogCode } from "../category";
import { createFacetList } from "../product/facet";
import { IFacets } from "@znode/types/facet";
import { AREA, errorStack, logServer } from "@znode/logger/server";

export async function getProductFacets({ searchTerm, categoryCode, brandCode }: { searchTerm: string; categoryCode: string; brandCode: string }) {
  try {
    const portalData = await getPortalDetails();
    const { storeCode, localeCode } = portalData || {};
    if (!portalData || !storeCode || !localeCode) throw new Error("Missing portal details");

    const catalogCode = (await getCatalogCode(portalData)) || "";
    const facetResponse = await ProductFacet_productFacet(searchTerm, categoryCode, brandCode, catalogCode, storeCode || "", localeCode || "");
    if (Array.isArray(facetResponse.Facets)) return createFacetList(facetResponse?.Facets) as IFacets[];
    else return [] as IFacets[];
  } catch (error) {
    logServer.error(AREA.Facet, "getProductFacet failed", { stack: errorStack(error) });
    return [] as IFacets[];
  }
}
