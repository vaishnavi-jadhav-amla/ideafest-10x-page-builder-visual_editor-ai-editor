import { generateFinalizeNumber } from "@znode/agents/checkout";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const cartNumber = searchParams.get("cartNumber");
    
    const finalizedNumber = await generateFinalizeNumber(String(cartNumber));
    return sendSuccess(finalizedNumber, "Finalized order number generated successfully");
  } catch (error) {
    return sendError("An error occurred while generating finalized order number." + String(error), 500);
  }
}