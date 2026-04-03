import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getEligibleOrderList } from "@znode/agents/account/return-order/get-return-list";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET() {
  try {
    const userData = await getSavedUserSession();
    const { userId } = userData ?? {};
    if (userId) {
      const customerAccountList = await getEligibleOrderList();
      return sendSuccess(customerAccountList, "Eligible order retrieved successfully.");
    } else {
      return sendError("User not authenticated.", 403);
    }
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while fetching the eligible orders.", 500);
  }
}
