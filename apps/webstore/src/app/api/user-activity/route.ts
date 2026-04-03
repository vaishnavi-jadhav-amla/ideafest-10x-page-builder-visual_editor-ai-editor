import { getSavedUserSession } from "@znode/utils/common";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { userActivity } from "@znode/agents/user-activity";
import { AREA, logServer } from "@znode/logger/server";

export async function POST(request: Request) {
  try {
    const dataRequest = await request.json();
    const userDetails = dataRequest?.userData ?? (await getSavedUserSession());
    const { storeCode, localeCode } = await getPortalHeader();
    const ua = request.headers.get("user-agent") ?? "";
    const referrerURL = request.headers.get("referer") ?? null;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = dataRequest.ip || forwardedFor?.split(",")[0] || "Unknown IP";

    if (!userDetails || Object.keys(userDetails).length === 0) {
      logServer.error(AREA.USER_ACTIVITY, `Failed to send user activity. Missing user details for event: ${dataRequest.eventType}`);
      return sendError("User information missing. Cannot log activity.", 400);
    }
    const userActivityModel = {
      ...dataRequest,
      userDetails,
      storeCode,
      localeCode,
      ua,
      referrerURL,
      ip,
    };

    await userActivity(userActivityModel);

    return sendSuccess(dataRequest?.eventName, "Event logged successfully.");
  } catch (error) {
    return sendError("An error occurred while logging event. " + String(error), 500);
  }
}
