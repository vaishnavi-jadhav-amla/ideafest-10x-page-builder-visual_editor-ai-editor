import { getCategoryListBySearchTerm } from "@znode/agents/search";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryCodes = searchParams.get("categoryCodes") ?? "";
    const searchTerm = searchParams.get("searchTerm") ?? "";

    const categoryList = await getCategoryListBySearchTerm(decodeURIComponent(searchTerm), categoryCodes);
    return sendSuccess(categoryList, "Category list retrieved.");
  } catch (error) {
    logServer.error(AREA.SEARCH, "Error in GET /category-list", { stack: errorStack(error), url: request.url });
    return sendError("Failed to retrieve the product facet.", 500);
  }
}
