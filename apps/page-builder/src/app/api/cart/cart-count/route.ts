import { sendError, sendSuccess } from "@znode/utils/server";

import { getCartCount } from "@znode/agents/cart";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartNumber = searchParams.get("cartNumber") || "";
    const initiator = searchParams.get("initiator") || "";
    const cartCountResponse = await getCartCount(cartNumber, initiator);
    return sendSuccess(cartCountResponse);
  } catch (error) {
    return sendError("Failed to get cart count." + String(error), 500);
  }
}
