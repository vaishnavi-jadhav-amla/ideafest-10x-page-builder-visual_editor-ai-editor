import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";
import { confirmResetPasswordLinkStatus } from "@znode/agents/user";

export async function POST(request: Request) {
  try {
    const { passwordToken, userName } = await request.json();
    if (!passwordToken) {
      return sendError("Password token is required.", 400);
    }
    const { portalId } = await getPortalHeader() || {};
    const passwordData = await confirmResetPasswordLinkStatus(passwordToken, userName, portalId);
    return sendSuccess(passwordData , "Reset password link status retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching reset password link status: " + String(error), 500);
  }
}