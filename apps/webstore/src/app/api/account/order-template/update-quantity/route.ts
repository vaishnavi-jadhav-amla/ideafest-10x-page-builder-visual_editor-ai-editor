import { updateTemplateItemQuantity } from "@znode/agents/account/order-template/update-quantity";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const { updateOrderTemplateModel } = await request.json();
    const updateTemplateQuantityResponse = await updateTemplateItemQuantity(updateOrderTemplateModel);
    return sendSuccess(updateTemplateQuantityResponse, "Order template item quantity updated successfully");
  } catch (error) {
    return sendError("An error occurred while updating order template item quantity." + String(error), 500);
  }
}
