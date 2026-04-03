import { sendError, sendSuccess } from "@znode/utils/server";

import { SETTINGS } from "@znode/constants/settings";
import { getSavedUserSession } from "@znode/utils/common";
import { getWishList } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize")) || SETTINGS.DEFAULT_PAGINATION;
    const pageIndex = Number(searchParams.get("pageIndex")) || SETTINGS.DEFAULT_PAGINATION;
    const userData = await getSavedUserSession();
    const { userId, email } = userData || {};
    if (userId) {
      const wishlistData = await getWishList(email as string, pageIndex, pageSize);
      return sendSuccess(wishlistData, "Wish list retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the wish list " + String(error), 500);
  }
}
