import { sendError, sendSuccess } from "@znode/utils/server";
import { validateSingleSignInToken } from "@znode/agents/single-sign-in";

export async function POST(request: Request) {
  try {
    const signInInfo = await request.json();
    const token = encodeURIComponent(signInInfo.singleSignIn) || "";
    const userSession = await validateSingleSignInToken(token || "");
    return sendSuccess(userSession);
  } catch (error) {
    return sendError("An error occurred while fetching the userSession." + String(error), 500);
  }
}
