import { mergeGuestUserCart } from "@znode/agents/cart";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const mergeCartRequest = await request.json();
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    const response = await mergeGuestUserCart(mergeCartRequest, userId);
    return sendSuccess(response, "guest user cart merged successfully.");
  } catch (error) {
    return sendError("An error occurred while merging guest user cart." + String(error), 500);
  }
}
