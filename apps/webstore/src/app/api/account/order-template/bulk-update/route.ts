import { bulkQuantityUpdate } from "@znode/agents/account/order-template/bulk-update";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function PUT(request: Request) {
  try {
    const { bulkQuantityModel } = await request.json();
    const updatedQuantityResponse = await bulkQuantityUpdate(bulkQuantityModel);
    return sendSuccess(updatedQuantityResponse, "Item quantity updated successfully");
  } catch (error) {
    return sendError("An error occurred while updating item quantity." + String(error), 500);
  }
}
