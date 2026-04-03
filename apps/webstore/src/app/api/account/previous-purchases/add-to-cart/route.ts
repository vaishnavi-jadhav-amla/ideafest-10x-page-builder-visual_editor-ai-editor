import { AREA, errorStack, logServer } from "@znode/logger/server";
import { getSavedUserSession, isPreviousPurchasesEnabled } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

import { addToCartPreviousPurchases } from "@znode/agents/account";
import { getPortalData } from "@znode/agents/product";

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
      const addToCartResponse = await addToCartPreviousPurchases(requestObject);
      return sendSuccess(addToCartResponse, "Add to cart successfully");
    } else {
      return sendError("User not authenticated.", 403);
    }
  } catch (error) {
    logServer.error(AREA.PREVIOUS_PURCHASES, errorStack(error));
    return sendError("Failed to add to cart. Please try again later.", 500);
  }
}
