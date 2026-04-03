import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { updatedReturnOrderDetails } from "@znode/agents/account/return-order/return-order";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.returnNumber) {
      return sendError("Order number is required.", 400);
    }
    const result = await updatedReturnOrderDetails(payload);
    return sendSuccess(result);
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while updating the return order.", 500);
  }
}
