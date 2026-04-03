import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { registerBStoreRequest } from "@znode/agents/b-stores/request-registration";
import { IBStoresRequestRegistrationModel } from "@znode/types/b-stores/request-registration";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const bStoresRequestRegistrationBody: IBStoresRequestRegistrationModel = requestBody.bStoresRequestRegistrationBody;
    const userSession = await getSavedUserSession();
    const { userId, aspNetUserId } = userSession || {};
    const { portalId } = await getPortalHeader() || {};

    if (userId && aspNetUserId && portalId) {
      bStoresRequestRegistrationBody.userId = userId;
      bStoresRequestRegistrationBody.portalId = portalId;
      const registrationResult = await registerBStoreRequest(bStoresRequestRegistrationBody);
      return sendSuccess(
        {
          isSuccess: registrationResult.isSuccess,
          hasError: registrationResult.hasError,
          errorMessage: registrationResult.errorMessage,
        },
        "B-Store registration request submitted successfully"
      );
    } else {
      return sendError(`Invalid User ID ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while submitting B-Store registration request " + String(error), 500);
  }
}
