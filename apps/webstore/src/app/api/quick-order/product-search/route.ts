import { sendSuccess, sendError } from "@znode/utils/server";
import { getProductDetailsBySKU } from "@znode/agents/quick-order/dynamic-form-template";
import { getPortalDetails } from "@znode/agents/portal";
import { getCatalogCode } from "@znode/agents/category";
import { getUserCatalogId } from "@znode/agents/user";
import { getSavedUserSession } from "@znode/utils/common";
import { IUser } from "@znode/types/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inputSku = searchParams.get("inputSku");
    if (!inputSku) {
      return sendError("SKU Is Required", 500);
    }
    const portalData = await getPortalDetails();
    const userData= await getSavedUserSession();
    const catalogCode = await getCatalogCode(portalData);
    const catalogId = await getUserCatalogId(portalData.publishCatalogId, portalData.portalProfileCatalogId, portalData.profileId, portalData.portalFeatureValues, userData as IUser);
    const suggestionList = await getProductDetailsBySKU(
      inputSku || "",
      portalData.portalId,
      portalData.localeId,
      catalogCode || "",
      portalData.localeCode || "",
      catalogId
    );
    if (suggestionList) return sendSuccess(suggestionList, "Search suggestion list retrieved successfully ");
    return sendError("An error occurred while fetching the search suggestion list", 500);
  } catch (error) {
    return sendError("An error occurred while fetching the search suggestion list" + String(error), 500);
  }
}
