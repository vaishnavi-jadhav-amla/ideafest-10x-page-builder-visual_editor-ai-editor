import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { forgotPassword } from "@znode/agents/user";

export async function POST(request: Request) {
  try {
    const { storeCode = "" } = await getPortalHeader();
    const dataRequestModel = await request.json();
    const passwordData = await forgotPassword(dataRequestModel, storeCode);
    if (passwordData?.hasError === false) {
      return sendSuccess(passwordData, "A link to reset the password has been sent to your Email Address.");
    } else {
      return sendSuccess("The entered Username/Email is invalid .");
    }
  } catch {
    return sendError("An error occurred during the forgot password process", 500);
  }
}
