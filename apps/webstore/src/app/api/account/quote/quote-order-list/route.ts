import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getUserQuoteList } from "@znode/agents/account/quote/quote-order-list";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId")||"";
    const pageSize = Number(searchParams.get("pageSize"));
    const pageIndex = Number(searchParams.get("pageIndex"));
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const currentFilters = JSON.parse(currentFiltersString || "");
    const sortValues = JSON.parse(sortValue || "");
    const userSession = await getSavedUserSession();
    const userId = userSession?.userId;
    if (userId) {
      const userQuoteList = await getUserQuoteList(accountId,userId as number, pageSize, pageIndex, sortValues, currentFilters);
      return sendSuccess(userQuoteList);
    } else {
      return sendError("UserId not found", 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of quote history. " + String(error), 500);
  }
}
