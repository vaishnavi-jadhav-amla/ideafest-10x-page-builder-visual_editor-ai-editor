import { getPortalDetails } from "@znode/agents/portal/portal";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET() {
  try {
    const captchaData = await getPortalDetails([
      { key: "attributeCode", value: "IsCaptchaRequired" },
      { key: "attributeCode", value: "SiteKey" },
      { key: "attributeCode", value: "SecretKey" },
    
    ]);
    if (captchaData) return sendSuccess(captchaData, "Captcha details retrieved.");
    else return sendError("Failed to retrieved captcha details", 404);
  } catch (error) {
    return sendError("An error occurred while fetching the captcha details" + String(error), 500);
  }
}
