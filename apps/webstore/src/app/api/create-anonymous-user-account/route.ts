import { sendError, sendSuccess } from "@znode/utils/server";

import { IPortalDetail } from "@znode/types/portal";
import { createAnonymousUserAccounts } from "@znode/agents/user";
import { getPortalDetails } from "@znode/agents/portal/portal";

export async function POST(request: Request) {
  try {
    const requestParameters = await request.json();
    const { shippingAddress, shippingEmailAddress, baseUrl } = requestParameters;

    const { profileId = 0, portalId }: IPortalDetail = await getPortalDetails();

    const user = await createAnonymousUserAccounts(shippingAddress, shippingEmailAddress, profileId, portalId, baseUrl);
    return sendSuccess(user);
  } catch (error) {
    return sendError("An error occurred while fetching the anonymous user." + String(error), 500);
  }
}
