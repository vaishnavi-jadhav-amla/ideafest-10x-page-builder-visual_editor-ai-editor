import { sendError, sendSuccess } from "@znode/utils/server";

import { getSuggestions } from "@znode/agents/search";
import { getPortalDetails } from "@znode/agents/portal";
import { getCatalogCode } from "@znode/agents/category";
import { getSavedUserSession } from "@znode/utils/common";
import { getUserCatalogId } from "@znode/agents/user";
import { IUser } from "@znode/types/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");
    const portalData = await getPortalDetails();
    const catalogCode = await getCatalogCode(portalData);
    const userData = await getSavedUserSession();
    const catalogId = await getUserCatalogId(
      portalData.publishCatalogId,
      portalData.portalProfileCatalogId,
      portalData.profileId,
      portalData.portalFeatureValues,
      userData as IUser
    );
    const suggestionList = await getSuggestions(
      searchTerm || "",
      portalData.portalId,
      portalData.localeId,
      portalData.localeCode || "",
      portalData?.storeCode || "",
      catalogCode || "",
      catalogId
    );
    if (suggestionList) return sendSuccess({ products: suggestionList, hasError: false }, "search suggestion list retrieved successfully ");
    return sendError("An error occurred while fetching the search suggestion list", 500);
  } catch (error) {
    return sendError("An error occurred while fetching the search suggestion list" + String(error), 500);
  }
}
