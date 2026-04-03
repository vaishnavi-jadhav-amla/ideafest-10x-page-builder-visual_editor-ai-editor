import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getDetailsByClassNumber } from "@znode/agents/account/return-order/return-order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classType = searchParams.get("classType");
    const classNumber = searchParams.get("classNumber");
    const isValidNumber = searchParams.get("isValidNumber");
    if (!classType || !classNumber) {
      return sendError("ClassType and classNumber query parameters are required.", 400);
    }
    const response = await getDetailsByClassNumber(classType, classNumber, isValidNumber as string);
    return sendSuccess(response, "Order details retrieved successfully.");
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while fetching the order details.", 500);
  }
}
