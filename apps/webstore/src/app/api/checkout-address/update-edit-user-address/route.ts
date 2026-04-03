import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getSavedUserSession } from "@znode/utils/common";
import { getUserAddressDetails } from "@znode/agents/address";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { editRequestModel, cartModel } = requestBody;

    const { addressId, isFromEdit, isGuestUser, otherAddressId, type } = editRequestModel;

    const editRequestPayload = {
      addressId: addressId,
      isFromEdit: isFromEdit,
      isGuestUser: isGuestUser,
      otherAddressId: otherAddressId,
      type: type,
    };

    const userSession = await getSavedUserSession();
    const userInfo = { accountId: userSession?.accountId, userId: userSession?.userId };

    const { portalId } = await getPortalHeader();
    const addressDetails = await getUserAddressDetails(portalId, editRequestPayload, userInfo, cartModel);
    return sendSuccess(addressDetails);
  } catch (error) {
    return sendError("An error occurred while fetching address details" + String(error), 500);
  }
}
