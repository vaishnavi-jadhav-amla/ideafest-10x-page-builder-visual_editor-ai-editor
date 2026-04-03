import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getReturnReceiptDetails } from "@znode/agents/account/return-order/return-order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classType = searchParams.get("classType") ;
    const classNumber = searchParams.get("classNumber");
    if (!classType || !classNumber) {
      return sendError("ClassType and classNumber query parameters are required.", 400);
    }
    const response = await getReturnReceiptDetails(classType, classNumber);
    return sendSuccess(response, "Return order receipt details retrieved successfully");
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while fetching the return order receipt details.", 500);
  }
}
