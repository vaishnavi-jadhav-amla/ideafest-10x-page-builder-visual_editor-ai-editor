import { sendError, sendSuccess } from "@znode/utils/server";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { getOrder } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderType = searchParams.get("orderType");
    const orderNumber = searchParams.get("orderNumber");

    if (orderType === ORDER_DATA_TYPE.ORDER && orderNumber) {
      const orderDetails = await getOrder(orderNumber);

      return sendSuccess(orderDetails, "Order details retrieved successfully.");
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of order details. " + String(error), 500);
  }
}
