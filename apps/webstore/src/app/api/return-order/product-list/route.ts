import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getReturnOrderProductList } from "@znode/agents/account/return-order/return-order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber") as string;
    if (!orderNumber) {
      return sendError("Order number is required.", 400);
    }
    const response = await getReturnOrderProductList(orderNumber);
    return sendSuccess(response, "Return order product list retrieved successfully.");
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while fetching the return order product list.", 500);
  }
}
