import { sendError, sendSuccess } from "@znode/utils/server";

import { getSavedUserSession } from "@znode/utils/common";
import { updateAccountInformationAddress } from "@znode/agents/account";

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      const accountAddress = await updateAccountInformationAddress(payload);
      return sendSuccess(accountAddress, "Account information updated successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while updating the account information address" + String(error), 500);
  }
}
