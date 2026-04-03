import { applyDiscount } from "@znode/agents/promotion";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataRequest = await request.json();
    const discountedDetailsResponse = await applyDiscount(dataRequest);
    return sendSuccess(discountedDetailsResponse, "Discount applied successfully.");
  } catch (error) {
    return sendError("An error occurred while applying discount." + String(error), 500);
  }
}
