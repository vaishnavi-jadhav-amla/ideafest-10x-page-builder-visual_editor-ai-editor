import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getAccountInformation } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET() {
  try {
    const portalData = await getPortalHeader();
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      const accountInformation = await getAccountInformation({ accountId: user?.accountId as number, roleName: user?.roleName as string }, portalData?.portalId);
      return sendSuccess(accountInformation, "Account information retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the account information " + String(error), 500);
  }
}
