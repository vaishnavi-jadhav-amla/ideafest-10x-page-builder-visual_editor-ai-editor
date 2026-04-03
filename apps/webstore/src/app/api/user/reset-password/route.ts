import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { resetPassword } from "@znode/agents/user";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const portalHeader = await getPortalHeader();
    const passwordData = await resetPassword(payload, portalHeader.storeCode as string);
    return sendSuccess(passwordData);
  } catch {
    return sendError("An error occurred while resetting password.", 500);
  }
}
