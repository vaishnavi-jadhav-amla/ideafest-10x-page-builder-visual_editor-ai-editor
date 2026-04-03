import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getSavedCartList } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize"));
    const pageIndex = Number(searchParams.get("pageIndex"));
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const currentFilters = JSON.parse(currentFiltersString || "");
    const sortValues = JSON.parse(sortValue || "");
    const userSession = await getSavedUserSession();
    const userId = userSession?.userId;
    if (userId) {
      const savedCartList = await getSavedCartList(userId, pageSize, pageIndex, sortValues, currentFilters);
      return sendSuccess(savedCartList);
    } else {
      return sendError(`Invalid User ID ${userSession?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of saved cart. " + String(error), 500);
  }
}
