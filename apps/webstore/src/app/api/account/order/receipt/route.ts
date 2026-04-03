import { sendError, sendSuccess } from "@znode/utils/server";

import { getOrder } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET( request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = Number(searchParams.get("orderId"));
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId && orderId) {
      const orderReceiptData = await getOrder(String(orderId));
      return sendSuccess(orderReceiptData, "Order receipt data fetched successfully.");
    } else if (userId && !orderId) {
      return sendError(`Invalid Order ID - ${userId}.`, 400);
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the order receipt " + String(error), 500);
  }
}
