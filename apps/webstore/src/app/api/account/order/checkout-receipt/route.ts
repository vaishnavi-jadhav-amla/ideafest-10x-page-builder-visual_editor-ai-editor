import { sendError, sendSuccess } from "@znode/utils/server";

import { orderCheckoutReceipt } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (orderId) {
      const response = await orderCheckoutReceipt(Number(orderId));
      return sendSuccess(response, "Order receipt data fetched successfully.");
    }
    return sendError("Missing Order Id", 400);
  } catch (error) {
    return sendError("An error occurred while fetching the order receipt " + String(error), 500);
  }
}
