import { sendError, sendSuccess } from "@znode/utils/server";

import { checkURLExistForSearchTerm } from "@znode/agents/search";
import { getPortalDetails } from "@znode/agents/portal/portal";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");
    
    const portalData = await getPortalDetails();
    const publishCatalogId = portalData?.publishCatalogId;
    const suggestionList = await checkURLExistForSearchTerm(searchTerm || "", publishCatalogId);
    return sendSuccess(suggestionList, "search list retrieved successfully ");
  } catch (error) {
    return sendError("An error occurred while fetching the search list" + String(error), 500);
  }
}
