import { updateAddressIds } from "@znode/agents/address";
import { sendError, sendSuccess } from "@znode/utils/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const requestParameters = await request.json();
    const { shippingAddressId, billingAddressId, shippingOptionId } = requestParameters;
    const cartNumber = cookies().get("CartNumber")?.value ?? "";
    const status = await updateAddressIds(shippingAddressId, billingAddressId, cartNumber, shippingOptionId);
    return sendSuccess(status);
  } catch (error) {
    return sendError("An error occurred while fetching updated address id status" + String(error), 500);
  }
}
