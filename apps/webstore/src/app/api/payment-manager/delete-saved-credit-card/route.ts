import { deleteSavedCardDetails } from "@znode/agents/payment";
import { sendError, sendSuccess } from "@znode/utils/server";


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerGuid = searchParams.get("customerGuid") as string;
    const configurationSetCode = searchParams.get("configurationSetCode");
    const paymentMethodToken = searchParams.get("paymentMethodToken");
    if (customerGuid && configurationSetCode && paymentMethodToken) {
      const deleteCardResponse = await deleteSavedCardDetails(customerGuid, configurationSetCode, paymentMethodToken);
      if(deleteCardResponse?.isSuccess)
        return sendSuccess(deleteCardResponse, "Credit card deleted successfully.");
      else
        return sendError("Failed to delete credit card.", 500);
    }
    else {
      return sendError("Missing required parameters.", 400);
    }
  } catch (error) {
    return sendError("Failed to delete credit card." + String(error), 500);
  }
}
