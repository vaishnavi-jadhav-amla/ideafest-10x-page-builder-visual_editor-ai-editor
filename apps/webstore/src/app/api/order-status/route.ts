import { sendError, sendSuccess } from "@znode/utils/server";
import { trackOrder } from "@znode/agents/order-status";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const orderStatusDetails = await trackOrder(payload);
    return sendSuccess(orderStatusDetails, "Order status retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the order status." + String(error), 500);
  }
}
