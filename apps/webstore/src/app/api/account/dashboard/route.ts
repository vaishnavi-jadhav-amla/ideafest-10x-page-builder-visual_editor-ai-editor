import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getDashBoard } from "@znode/agents/account/account-dashboard";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET(request: Request) {
  try {
    const userData = await getSavedUserSession();
    const userId = userData?.userId;
    const { searchParams } = new URL(request.url);
    const isAddressBook = searchParams.get("isAddressBook");
    const portalData = await getPortalHeader();

    if (userId && portalData.portalId) {
      const dashBoardDetails = await getDashBoard(userId, portalData.portalId, Boolean(isAddressBook));
      return sendSuccess(dashBoardDetails, "Dashboard Details retrieved successfully");
    } else {
      return sendError(`Invalid User ID - ${userId}`, 403);
    }
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
