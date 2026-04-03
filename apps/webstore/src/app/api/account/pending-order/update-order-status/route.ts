import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { updateOrderStatus } from "@znode/agents/account";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { updateQuoteStatus } from "@znode/agents/account";

export async function PUT(request: Request) {
  try {
    const { orderType, orderNumber, status } = await request.json();
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      if (orderType === ORDER_DATA_TYPE.APPROVAL_ROUTING) {
        const orderStatus = await updateOrderStatus(orderNumber, status);
        return sendSuccess(orderStatus, "Order status updated successfully.");
      } else if (orderType === ORDER_DATA_TYPE.QUOTE) {
        const response = await updateQuoteStatus(orderType, orderNumber, status);
        return sendSuccess(response, "Quote status updated successfully");
      } else {
        return sendError(`Invalid User ID - ${userId}.`, 403);
      }
    }
  } catch (error) {
    return sendError("An error occurred while updating the order status." + String(error), 500);
  }
}
