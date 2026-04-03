import { sendError, sendSuccess } from "@znode/utils/server";
import { getShippingOptions } from "@znode/agents/checkout";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { shippingRequest } = requestBody;
    if (!shippingRequest) {
      return sendError("Shipping request data is required.", 400);
    }
    const shippingOptions = await getShippingOptions(shippingRequest);
    return sendSuccess(shippingOptions, "Shipping options retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching shipping options: " + String(error), 500);
  }
}
