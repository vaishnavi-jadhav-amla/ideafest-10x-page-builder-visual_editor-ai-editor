import { sendError, sendSuccess } from "@znode/utils/server";

import { IRegisterUserRequest } from "@znode/types/user";
import { getPortalDetails } from "@znode/agents/portal";
import { registerNewUser } from "@znode/agents/user";
import { IPortalDetail } from "@znode/types/portal";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const portalData = await getPortalDetails();

    const newRegisteredUser = await registerNewUser(
      payload as IRegisterUserRequest,
      {
        localeId: portalData.localeId,
        portalId: portalData.portalId,
        userVerificationTypeCode: portalData.userVerificationTypeCodeValue,
        publishCatalogId: portalData.publishCatalogId,
      } as IPortalDetail
    );

    const errorMessage = newRegisteredUser?.errorMessage;

    return sendSuccess(newRegisteredUser, errorMessage);
  } catch (error) {
    return sendError("An error occurred while registering user. " + String(error), 500);
  }
}
