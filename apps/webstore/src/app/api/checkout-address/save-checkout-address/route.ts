import { sendError, sendSuccess } from "@znode/utils/server";

import { getPortalDetails } from "@znode/agents/portal/portal";
import { updateAddress } from "@znode/agents/address";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { addressModel, isFormChange, addressType, cartModel } = requestBody;
    if (addressModel) {
      const portalData = await getPortalDetails();
      const addressResponse = await updateAddress(portalData, addressModel, isFormChange, addressType, cartModel);
      return sendSuccess(addressResponse);
    } else {
      return sendError("Error occurred because address model is missing", 500);
    }
  } catch (error) {
    return sendError("An error occurred while fetching updated address" + String(error), 500);
  }
}
