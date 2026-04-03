import { getPortalDetails } from "@znode/agents/portal";
import { getOTPDetails } from "@znode/agents/user";
import { IPortalDetail } from "@znode/types/portal";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const userDetails = await getSavedUserSession();
    if (userDetails) return sendError("Access to multi-factor authentication is not required as the user is already authenticated.", 403);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || 0;
    const userAgent = request.headers.get("user-agent") || "";
    const portalDetail: IPortalDetail = await getPortalDetails();
    const websiteLogoLink = portalDetail ? `${portalDetail.mediaServerUrl || ""}${portalDetail.websiteLogo || ""}` : "";
    const storeCode = portalDetail?.storeCode || "";
    const enableCartRedirection = portalDetail?.portalFeatureValues?.persistentCart || false;
    const otpDetailsResponse = await getOTPDetails(Number(userId), userAgent, websiteLogoLink, storeCode, enableCartRedirection);
    return sendSuccess(otpDetailsResponse, "OTP Details Fetched successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching OTP Details." + String(error), 500);
  }
}
