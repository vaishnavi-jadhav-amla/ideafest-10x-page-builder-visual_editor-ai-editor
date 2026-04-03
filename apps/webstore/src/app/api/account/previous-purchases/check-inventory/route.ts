import { AREA, errorStack, logServer } from "@znode/logger/server";
import { getSavedUserSession, isPreviousPurchasesEnabled } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getPortalData } from "@znode/agents/product";
import { validatedInventory } from "@znode/agents/account";

export async function POST(request: Request) {
  try {
    const requestObject = await request.json();
    if (!requestObject) {
      return sendError("Invalid request body.", 400);
    }
    const userSession = await getSavedUserSession();
    const { userId } = userSession || {};
    if (userId) {
      const portalData = await getPortalData();
      const enablePreviousPurchases = isPreviousPurchasesEnabled(portalData);

      if (!enablePreviousPurchases) {
        return sendError("Previous purchases are not enabled for this portal", 403);
      }
      const userDetails = await validatedInventory(requestObject , portalData.publishStateName || "");
      return sendSuccess(userDetails, "Inventory validation successful");
    } else {
      return sendError("User not authenticated.", 403);
    }
  } catch (error) {
    logServer.error(AREA.PREVIOUS_PURCHASES, errorStack(error));
    return sendError("An error occurred while validating the inventory.", 500);
  }
}
