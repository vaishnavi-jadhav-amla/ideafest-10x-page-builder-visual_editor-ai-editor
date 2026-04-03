import { removeDiscount } from "@znode/agents/promotion";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function DELETE(request: Request) {
  try {
    const dataRequest = await request.json();
    const response = await removeDiscount(dataRequest);
    return sendSuccess(response, "Discount removed successfully.");
  } catch (error) {
    return sendError("Failed to remove discount." + String(error), 500);
  }
}
