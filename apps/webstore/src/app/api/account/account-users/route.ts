import { sendError, sendSuccess } from "@znode/utils/server";

import { SETTINGS } from "@znode/constants/settings";
import { getCustomerAccountList } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize")) || SETTINGS.DEFAULT_PAGINATION;
    const pageIndex = Number(searchParams.get("pageIndex")) || SETTINGS.DEFAULT_PAGINATION;
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const currentFilters = JSON.parse(currentFiltersString ?? "");
    const sortValues = JSON.parse(sortValue ?? "");
    const userData = await getSavedUserSession();
    const { userId, accountId } = userData ?? {};
    if (userId) {
      const customerAccountList = await getCustomerAccountList(accountId as number, userId, pageSize, pageIndex, sortValues, currentFilters);
      return sendSuccess(customerAccountList, "Account users retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the account users " + String(error), 500);
  }
}
