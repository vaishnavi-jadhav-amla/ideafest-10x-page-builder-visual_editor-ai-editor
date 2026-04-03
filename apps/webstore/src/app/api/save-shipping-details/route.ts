import { sendError, sendSuccess } from "@znode/utils/server";
import { updateShippingDetails } from "@znode/agents/checkout";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestParameters = await request.json();
    const { updateShippingDetailsRequest } = requestParameters;
    if (!updateShippingDetailsRequest) {
      return sendError("Update shipping details request data is required.", 400);
    }
    const status = await updateShippingDetails(updateShippingDetailsRequest);
    return sendSuccess(status, "Shipping details updated successfully.");
  } catch (error) {
    return sendError("An error occurred while updating shipping details: " + String(error), 500);
  }
}
