import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { impersonationLogin } from "@znode/agents/impersonation";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const portalHeader = await getPortalHeader();
    const userSession = await impersonationLogin(data.impersonation || "", portalHeader.storeCode || "");
    return sendSuccess(userSession);
  } catch (error) {
    return sendError("An error occurred while fetching the userSession." + String(error), 500);
  }
}
