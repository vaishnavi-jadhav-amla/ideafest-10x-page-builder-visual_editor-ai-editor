import { createAnonymousUserAddressId } from "@znode/agents/user";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const requestParameters = await request.json();
    const { addressRequest } = requestParameters;

    const userAddressResponse = await createAnonymousUserAddressId(addressRequest);
    return sendSuccess(userAddressResponse);
  } catch (error) {
    return sendError("An error occurred while fetching the anonymous user address." + String(error), 500);
  }
}
