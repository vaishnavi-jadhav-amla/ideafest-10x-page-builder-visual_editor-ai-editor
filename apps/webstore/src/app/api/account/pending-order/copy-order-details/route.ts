import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { copyOrderDetails, copyQuoteDetails, copySavedCartToCart } from "@znode/agents/account";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { copyToCart } from "@znode/agents/account/order-template";

export async function POST(request: Request) {
  try {
    const requestObject = await request.json();
    const { orderType, orderNumber } = requestObject || {};
    const currentUser = await getSavedUserSession();
    if (currentUser && currentUser?.userId) {
      if (orderType === ORDER_DATA_TYPE.APPROVAL_ROUTING) {
        const orderDetails = await copyOrderDetails(orderNumber);
        return sendSuccess(orderDetails, "Order details copied successfully.");
      } else if (orderType === ORDER_DATA_TYPE.QUOTE) {
        const response = await copyQuoteDetails(orderNumber);
        return sendSuccess(response, "Quote details copied successfully");
      } else if (orderType === ORDER_DATA_TYPE.ORDER_TEMPLATE) {
        const response = await copyToCart(orderNumber);
        return sendSuccess(response, "Order template copied successfully");
      } else if (orderType === ORDER_DATA_TYPE.SAVED_CARTS) {
        const response = await copySavedCartToCart(orderNumber);
        return sendSuccess(response, "Saved cart copied successfully");
      } else {
        return sendError(`Invalid User ID ${currentUser?.userId}.`, 403);
      }
    }
  } catch (error) {
    return sendError("An error occurred while copying order details. " + String(error), 500);
  }
}
