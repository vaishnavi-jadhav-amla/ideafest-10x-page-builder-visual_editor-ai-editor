import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { deleteAddress } from "@znode/agents/address/address-book";
import { getSavedUserSession } from "@znode/utils/common";

export async function POST(request: Request) {
  try {
    const dataResponse = await request.json();
    const userSession = await getSavedUserSession();
    const userInfo = { accountId: userSession?.accountId, userId: userSession?.userId };

    // Check if addressId exists
    if (!dataResponse?.addressId) {
      return sendError("Address ID is required", 403);
    }

    const portalData = await getPortalHeader();
    const deleteResponse = await deleteAddress(dataResponse.addressId, portalData.portalId, userInfo);

    return sendSuccess(deleteResponse, "Address deleted successfully");
  } catch (error) {
    return sendError("An error occurred while deleting address " + String(error), 500);
  }
}
