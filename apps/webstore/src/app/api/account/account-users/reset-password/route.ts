import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";
import { accountUserResetPassword } from "@znode/agents/account";

export async function POST(request: Request) {
  try {
    const { baseUrl, userName } = await request.json();
    const { storeCode = "" } = await getPortalHeader();
    if (userName) {
      const passwordData = await accountUserResetPassword(userName, baseUrl, storeCode);
      return sendSuccess({ passwordData }, "Reset password successfully.");
    } else {
      return sendError(`Invalid UserName - ${userName}`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while reset password" + String(error), 500);
  }
}
