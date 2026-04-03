import { validateOneTimePassword } from "@znode/agents/user";
import { IValidateMultiFactorAuthenticationResponse } from "@znode/types/user";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataRequest = await request.json();
    const { portalId } = await getPortalHeader();
    const userAgent = request.headers.get("user-agent") || "";
    const validateOTPPayload = {
      ...dataRequest,
      PortalId: portalId || 0,
      BrowserName: "Chrome", //details will get modified in agent.
      MachineName: "Chrome",
      PlatformName: "Chrome",
    };
    const validateOTPResponse: IValidateMultiFactorAuthenticationResponse = await validateOneTimePassword(validateOTPPayload, userAgent);
    return sendSuccess(validateOTPResponse, "OTP validated successfully.");
  } catch (error) {
    return sendError("An error occurred while validating OTP." + String(error), 500);
  }
}
