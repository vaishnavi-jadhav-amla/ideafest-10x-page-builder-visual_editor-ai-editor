import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getUserBStoreRoleAccess } from "@znode/agents/b-stores/user-role-access";

export async function GET() {
  try {
    const userSession = await getSavedUserSession();

    // Validate session earlier
    if (!userSession || !userSession.userId || !userSession.aspNetUserId) {
      return sendError("User is not authenticated", 401);
    }

    const roleAccess = await getUserBStoreRoleAccess(userSession.userId.toString());
    if (!roleAccess) {
      return sendError("User does not have access to B-Store roles", 403);
    }

    // consistent success response
    return sendSuccess(roleAccess, "User B-Store role access retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching user B-Store role access", 500);
  }
}
