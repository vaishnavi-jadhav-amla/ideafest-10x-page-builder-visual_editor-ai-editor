import { AREA, errorStack, logServer } from "@znode/logger/server";
import { getSavedUserSession, isPreviousPurchasesEnabled } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

import { SETTINGS } from "@znode/constants/settings";
import { getPortalData } from "@znode/agents/product";
import { getPreviousPurchases } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize") ?? SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
    const pageIndex = Number(searchParams.get("pageIndex") ?? SETTINGS.DEFAULT_TABLE_PAGE_INDEX);
    const search = String(searchParams.get("search"));
    const sortValue = searchParams.get("sortValue");
    const filterDays = searchParams.get("filterDays") || "";
    const sortValues = JSON.parse(sortValue ?? "");

    const user = await getSavedUserSession();
    const loggedInUserId: number = user?.userId ?? 0;
    if (loggedInUserId) {
      const portalData = await getPortalData();
      const enablePreviousPurchases = isPreviousPurchasesEnabled(portalData);
      
      if (!enablePreviousPurchases) {
        return sendError("Previous purchases are not enabled for this portal", 403);
      }
      
      const previousPurchasesData = await getPreviousPurchases(pageSize, pageIndex, sortValues, search, filterDays);
      return sendSuccess(previousPurchasesData, "Previous purchases fetched successfully.");
    } else {
      return sendError("User not authenticated.", 403);
    }
  } catch (error) {
    logServer.error(AREA.PREVIOUS_PURCHASES, errorStack(error));
    return sendError("An error occurred while fetching the list of previous purchases.", 500);
  }
}
