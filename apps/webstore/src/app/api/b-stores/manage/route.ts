import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";
import { manageBStoreRequest } from "@znode/agents/b-stores/manage";
import { getSavedUserSession } from "@znode/utils/common";

export async function POST() {
  try {
    const userSession = await getSavedUserSession();
    const portalHeader = await getPortalHeader();
    const { userId } = userSession || {};
    const { storeCode } = portalHeader || {};

    if (!userId) {
      return sendError("Invalid request: userId is missing.", 403);
    } else if (!storeCode) {
      return sendError("Invalid request: storeCode is missing.", 403);
    } else {
      const manageBStoreData = await manageBStoreRequest(userId, storeCode);
      return sendSuccess(manageBStoreData, "B-Store manage request submitted successfully.");
    }
  } catch (error) {
    return sendError("An error occurred while submitting B-Store manage request: " + String(error), 500);
  }
}
