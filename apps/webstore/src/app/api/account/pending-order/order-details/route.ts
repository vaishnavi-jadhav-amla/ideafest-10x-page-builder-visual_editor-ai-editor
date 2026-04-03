import { sendError, sendSuccess } from "@znode/utils/server";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { getSavedUserSession } from "@znode/utils/common";
import { pendingOrderReceiptDetails } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderType = searchParams.get("orderType");
    const orderNumber = searchParams.get("orderNumber");
    const userData = await getSavedUserSession();
    if (userData?.userId && orderType === ORDER_DATA_TYPE.APPROVAL_ROUTING && orderNumber) {
      const orderDetails = await pendingOrderReceiptDetails(orderType, orderNumber);
      return sendSuccess(orderDetails, "Order details retrieved successfully.");
    } else {
      return sendError(`Invalid User ID ${userData?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the details of order. " + String(error), 500);
  }
}
