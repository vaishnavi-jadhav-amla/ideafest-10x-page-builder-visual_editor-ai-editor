import { sendError, sendSuccess } from "@znode/utils/server";

import { reorderOrder } from "@znode/agents/account";

export async function POST(request: Request) {
  try {
    const reorderRequestModel = await request.json();
    const reorderStatus = await reorderOrder(reorderRequestModel);
    return sendSuccess(reorderStatus, "Order successfully reordered.");
  } catch (error) {
    return sendError("An error occurred while reordering the order: " + String(error), 500);
  }
}
