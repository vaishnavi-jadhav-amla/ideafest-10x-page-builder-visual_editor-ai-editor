import { getHighlightInfoByCode } from "@znode/agents/product";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const highlightsAttribute = await getHighlightInfoByCode(data.highlightCode || "", data.publishProductId);
    return sendSuccess(highlightsAttribute);
  } catch (error) {
    return sendError("An error occurred while fetching the highlight details." + String(error), 500);
  }
}
