import { getProductFacets } from "@znode/agents/product-facet";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") ?? "";
    const categoryCode = searchParams.get("categoryCode") ?? "";
    const brandCode = searchParams.get("brandCode") ?? "";
    const facetList = await getProductFacets({ searchTerm, categoryCode, brandCode });
    return sendSuccess(facetList, "Facet fetched successfully.");
  } catch (error) {
    logServer.error(AREA.Facet, "Error in GET /product-facet", { stack: errorStack(error) });
    return sendError("Failed to retrieve the product facet.", 500);
  }
}
