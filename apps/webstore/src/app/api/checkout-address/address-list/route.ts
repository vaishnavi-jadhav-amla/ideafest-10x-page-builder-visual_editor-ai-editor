import { getBillingShippingAddress } from "@znode/agents/address";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSavedUserSession();
  const userId: number = user?.userId ?? 0;
  try {
    const requestBody = await request.json();
    if (requestBody) {
      const { isCartAddress, type, addressId, otherAddressId, isFromEdit } = requestBody.editRequestModel;
      const cartModel = requestBody.cartModel;

      const guestAddressData = await getBillingShippingAddress(userId, isCartAddress, type, addressId, otherAddressId, isFromEdit, cartModel);
      return sendSuccess(guestAddressData);
    } else {
      return sendError("Request body is missing while fetching address list", 404);
    }
  } catch (error) {
    return sendError("An error occurred while fetching billing and shipping address list" + String(error), 500);
  }
}
