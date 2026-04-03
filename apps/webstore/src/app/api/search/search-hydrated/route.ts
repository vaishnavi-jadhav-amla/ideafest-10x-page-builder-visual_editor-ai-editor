import { sendError, sendSuccess } from "@znode/utils/server";

import { getCatalogCode } from "@znode/agents/category";
import { getHydratedSearchContent } from "@znode/agents/search";
import { getPortalDetails } from "@znode/agents/portal/portal";
import { getSavedUserSession } from "@znode/utils/common";

export const dynamic = "force-dynamic";

export async function GET() {
  try { 
    const portalData = await getPortalDetails();
    const storeCode = portalData.storeCode;
    const localeCode = portalData.portalLocales?.at(0)?.code ?? "en-US";
    const catalogCode = await getCatalogCode(portalData);
    const userData = await getSavedUserSession();
    const userProfileId = userData?.profileId || portalData?.profileId;

    if (!catalogCode || !userProfileId) {
      return sendError("Catalog id or user profile id is unavailable", 400);
    }

    const hydratedSearchList = await getHydratedSearchContent(
      catalogCode,
      userProfileId,
      storeCode as string,
      localeCode
    );

    return sendSuccess(hydratedSearchList, "Hydrated search list retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the hydrated search list: " + String(error), 500);
  }
}