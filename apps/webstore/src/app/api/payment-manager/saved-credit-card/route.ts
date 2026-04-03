import { savedCardDetails } from "@znode/agents/payment";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerGuid = searchParams.get("customerGuid");
    const configurationSetCode = searchParams.get("configurationSetCode");
    if (customerGuid && configurationSetCode) {
      const savedCardDetailsResponse = await savedCardDetails(customerGuid, configurationSetCode);
      if(savedCardDetailsResponse !== null)
        return sendSuccess(savedCardDetailsResponse, "Saved card details retrieved successfully.");
      else
        return sendError("Failed to fetch saved credit card details.", 500);
    } else {
      return sendError("Missing required parameters.", 400);
    }
  } catch(error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
