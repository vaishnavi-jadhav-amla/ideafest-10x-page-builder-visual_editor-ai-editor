import { sendError, sendSuccess } from "@znode/utils/server";

import { createWishList } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const user = (await getSavedUserSession()) || {};
    const userId: number = user.userId ?? 0;
    if (userId) {
      const wishlistData = await createWishList({ ...payload, userName: user.email });
      return sendSuccess(wishlistData, " Wish list created successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while creating the wish list. " + String(error), 500);
  }
}
