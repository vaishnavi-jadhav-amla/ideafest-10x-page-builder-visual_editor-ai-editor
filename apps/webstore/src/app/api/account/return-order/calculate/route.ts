import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getReturnOrderCalculationDetails } from "@znode/agents/account/return-order/get-return-list";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload) {
      return sendError("Request data is required`", 400);
    }
    const response = await getReturnOrderCalculationDetails(payload);
    return sendSuccess(response, "get return order calculation details successfully.");
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while get return order calculation details", 500);
  }
}
