import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getWishListByProductSkus } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skus = searchParams.get("skus") || "";
    const userData = await getSavedUserSession();
    const { userId, email } = userData || {};
    if (userId) {
      const wishlistData = await getWishListByProductSkus(email as string, skus);
      return sendSuccess(wishlistData, "Wish list retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the wish list " + String(error), 500);
  }
}
