import { updateBillingAddressId } from "@znode/agents/checkout";
import { sendError, sendSuccess } from "@znode/utils/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const requestParameters = await request.json();
    const { billingAddressId } = requestParameters;
    const cartNumber = cookies().get("CartNumber")?.value ?? "";
    const status = await updateBillingAddressId(billingAddressId, cartNumber);
    return sendSuccess(status);
  } catch (error) {
    return sendError("An error occurred while fetching updated billing address id status" + String(error), 500);
  }
}
