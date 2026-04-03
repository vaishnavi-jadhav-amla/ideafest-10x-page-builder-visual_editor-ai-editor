import { sendError, sendSuccess } from "@znode/utils/server";

import { deleteWishList } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function DELETE(request: Request) {
  try {
    const payload = await request.json();
    const user = (await getSavedUserSession()) || {};

    const userId: number = user?.userId ?? 0;
    if (userId) {
      const deleteResponse = await deleteWishList({ ...payload, userName: user.email });
      return sendSuccess(deleteResponse, " Wish list deleted successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while deleting the wish list. " + String(error), 500);
  }
}
