import { removeShippingByClassNumber } from "@znode/agents/checkout";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartNumber = searchParams.get("cartNumber") || "";
    const status = await removeShippingByClassNumber(cartNumber);
    return sendSuccess(status, "Shipping options removed successfully.");
  } catch (error) {
    return sendError("Failed to remove Shipping options." + String(error), 500);
  }
}
