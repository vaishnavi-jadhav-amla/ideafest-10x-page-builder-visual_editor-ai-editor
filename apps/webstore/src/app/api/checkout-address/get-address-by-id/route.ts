import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getAddressById } from "@znode/agents/address/address-book";
import { getSavedUserSession } from "@znode/utils/common";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = Number(searchParams.get("addressId"));
    if (addressId) {
      const userSession = await getSavedUserSession();
      const { portalId } = await getPortalHeader();
      const userInfo = { accountId: userSession?.accountId, userId: userSession?.userId };
      const addressDetails = await getAddressById(addressId, portalId, userInfo);
      return sendSuccess(addressDetails);
    } else {
      return sendError("Error is occurred while fetching address id is missing", 404);
    }
  } catch (error) {
    return sendError("An error occurred while fetching address" + String(error), 500);
  }
}
