import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getSavedUserSession } from "@znode/utils/common";
import { updateAddressBillingShippingFlag } from "@znode/agents/address/address-book";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isDefaultBillingAddress = searchParams.get("isDefaultBillingAddress");
    const addressId = searchParams.get("addressId");
    const userSession = await getSavedUserSession();
    const userInfo = { accountId: userSession?.accountId, userId: userSession?.userId };

    if (!isDefaultBillingAddress || !addressId) {
      return sendError("Missing or invalid query parameters.", 400);
    }

    const portalData = await getPortalHeader();
    const addressModel = await updateAddressBillingShippingFlag(Number(addressId), isDefaultBillingAddress.toLowerCase() === "true", portalData.portalId, userInfo);
    return sendSuccess(addressModel, "Address updated successfully.");
  } catch (error) {
    return sendError("An error occurred while updating address " + String(error), 500);
  }
}
