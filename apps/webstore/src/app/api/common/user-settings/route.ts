import { sendError, sendSuccess } from "@znode/utils/server";

import { getPortalDetails } from "@znode/agents/portal/portal";

export async function GET() {
  try {
    const portalData = await getPortalDetails();
    const userSettings = {
      userVerificationTypeCode: portalData?.userVerificationTypeCodeValue,
      globalAttributes: portalData?.globalAttributes,
      portalId: portalData?.portalId,
      storeCode: portalData?.storeCode,
    };
    return sendSuccess(userSettings, "user setting details received successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the user setting details" + String(error), 500);
  }
}
