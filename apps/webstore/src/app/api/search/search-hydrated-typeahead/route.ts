import { getSavedUserSession, stringToBooleanV2 } from "@znode/utils/common";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getCatalogCode } from "@znode/agents/category";
import { getHydratedTypeaheadSearchContent } from "@znode/agents/search";
import { getPortalDetails } from "@znode/agents/portal/portal";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");
    const isCategoryCode = stringToBooleanV2(searchParams.get("isCategoryCode"));
    const portalData = await getPortalDetails();
    const portalHeaderData = await getPortalHeader();
    const storeCode = portalData.storeCode;
    const localeCode = portalHeaderData.localeCode;
    const portalId = portalData.portalId;
    const catalogCode = await getCatalogCode(portalData);
    const userData = await getSavedUserSession();
    const userId = userData?.userId;
    const userProfileId = userData?.profileId || portalData?.profileId;
    const isTypeaheadSearchEnabled = portalData?.portalFeatureValues?.enableTypeaheadSearchSettings;
    if (!catalogCode) {
      return sendError("Catalog id is unavailable", 400);
    }
    const filter = searchParams.get("filter");
    const [categoryCode, refineBy] = isCategoryCode ? [filter, undefined] : [undefined, filter];
    let parsedData;
    let refineByData;

    if (refineBy !== null && refineBy !== undefined) {
      try {
        parsedData = JSON.parse(refineBy);
        const result: Record<string, string[]> = {
          [parsedData.attributeCode]: [parsedData.attributeValue],
        };
        refineByData = JSON.stringify(result);
      } catch (error) {
        return sendError(`Invalid filter parameter received for refineBy. ${refineByData}` + String(error), 400);
      }
    }

    const hydratedSearchList = await getHydratedTypeaheadSearchContent(
      searchTerm?.trim() || ("" as string),
      catalogCode,
      userId as number,
      storeCode as string,
      localeCode,
      portalId,
      userProfileId as number,
      categoryCode as string,
      refineByData || "",
      isTypeaheadSearchEnabled
    );
    return sendSuccess(hydratedSearchList, "Hydrated search list retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the hydrated search list: " + String(error), 500);
  }
}
