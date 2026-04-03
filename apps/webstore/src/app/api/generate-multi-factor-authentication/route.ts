import { generateOneTimePassword } from "@znode/agents/user";
import { IValidateMultiFactorAuthenticationResponse } from "@znode/types/user";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataRequest = await request.json();
    const { portalId } = await getPortalHeader();
    const userAgent = request.headers.get("user-agent") || "";
    const generateOTPPayload = {
      ...dataRequest,
      PortalId: portalId || 0,
    };
    const generateOTPResponse: IValidateMultiFactorAuthenticationResponse = await generateOneTimePassword(generateOTPPayload, userAgent);
    return sendSuccess(generateOTPResponse, "OTP Generated successfully.");
  } catch (error) {
    return sendError("Failed to generate OTP. Please try again later." + String(error), 500);
  }
}
