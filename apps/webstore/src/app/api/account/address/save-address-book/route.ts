import { sendError, sendSuccess } from "@znode/utils/server";

import { createUpdateUserAddress } from "@znode/agents/address";
import { getPortalDetails } from "@znode/agents/portal/portal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { address, addressType, cartModel } = requestBody;
    
    const portalData = await getPortalDetails();
    const addressModel = await createUpdateUserAddress(portalData, address, addressType, cartModel);
    return sendSuccess(addressModel);
  } catch (error) {
    return sendError("An error occurred while update user address " + String(error), 500);
  }
}
