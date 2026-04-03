import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { loginUser } from "@znode/agents/user";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const portalHeader = await getPortalHeader();
    const userAgent = request.headers.get("user-agent") || "";
    const updatedPayload = {
      StoreCode: portalHeader?.storeCode || "",
      User: {
        Username: payload.username || "",
        Password: payload.password || "",
      },
    };
    const loginResponse = await loginUser(updatedPayload, userAgent);
    return sendSuccess(loginResponse);
  } catch {
    return sendError("An error occurred while Logging User.", 401);
  }
}
