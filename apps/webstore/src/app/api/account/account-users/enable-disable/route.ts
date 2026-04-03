import { accountEnableDisable } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const user = await getSavedUserSession();
    const loggedInUserId: number = user?.userId ?? 0;
    if (loggedInUserId) {
      const enabledDisabledAccountData = await accountEnableDisable(payload.userId, payload.isLock, loggedInUserId);
      return sendSuccess(enabledDisabledAccountData, enabledDisabledAccountData.message ?? "Account Enabled/Disabled Successfully.");
    } else {
      return sendError(`Invalid User ID - ${loggedInUserId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while updating the account status " + String(error), 500);
  }
}
