import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { createReturnOrder } from "@znode/agents/account/return-order/return-order";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.orderNumber) {
      return sendError("Order number is required.", 400);
    }
    const result = await createReturnOrder(payload);
    return sendSuccess(result);
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while creating the return order.", 500);
  }
}
