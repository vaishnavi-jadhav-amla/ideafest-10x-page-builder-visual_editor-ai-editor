import { editSaveCartName } from "@znode/agents/account/saved-cart";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function PUT(request: Request) {
  try {
    const requestBody = await request.json();
    const session = await getSavedUserSession();
    const userId = session?.userId || 0;
    const status = await editSaveCartName(requestBody?.classType, requestBody?.cartNumber, requestBody?.className, userId);
    return sendSuccess(status, "Save cart name updated successfully.");
  } catch (error) {
    return sendError("An error occurred while updating the saved cart name." + String(error), 500);
  }
}
