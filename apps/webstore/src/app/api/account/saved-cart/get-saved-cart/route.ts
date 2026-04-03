import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getSavedCart } from "@znode/agents/account";

export async function GET() {
  try {
    const userSession = await getSavedUserSession();
    const userId = userSession?.userId;
    if (userId) {
      const savedCartList = await getSavedCart(userId);
      return sendSuccess(savedCartList);
    } else {
      return sendError(`Invalid User ID ${userSession?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of saved cart. " + String(error), 500);
  }
}
