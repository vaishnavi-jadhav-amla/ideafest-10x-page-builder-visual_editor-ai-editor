import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

import { deleteReturnOrder } from "@znode/agents/account/return-order/get-return-list";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnNumber = searchParams.get("returnNumber");
    if (!returnNumber) {
      return sendError("Return number is required.", 400);
    }
    const deleteReturnOrderResponse = await deleteReturnOrder(returnNumber);
    return sendSuccess(deleteReturnOrderResponse, "Return request deleted successfully.");
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("Failed to Delete Return order.", 500);
  }
}
