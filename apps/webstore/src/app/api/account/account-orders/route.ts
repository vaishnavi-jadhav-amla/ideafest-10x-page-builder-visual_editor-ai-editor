import { sendError, sendSuccess } from "@znode/utils/server";

import { SETTINGS } from "@znode/constants/settings";
import { getAccountUserOrderList } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { ACCOUNT } from "@znode/constants/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize")) || SETTINGS.DEFAULT_PAGINATION;
    const pageIndex = Number(searchParams.get("pageIndex")) || SETTINGS.DEFAULT_PAGINATION;
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const requestedUserId = Number(searchParams.get("userId"));
    const currentFilters = JSON.parse(currentFiltersString ?? "");
    const sortValues = JSON.parse(sortValue ?? "");
    const userData = await getSavedUserSession();
    if (userData && userData.userId && (userData.roleName || "").toLocaleLowerCase() === ACCOUNT.ADMINISTRATOR_ROLE_NAME.toLocaleLowerCase()) {
      const accountOrderList = await getAccountUserOrderList(ORDER_DATA_TYPE.ORDER, requestedUserId, pageSize, pageIndex, sortValues, currentFilters);
      return sendSuccess(accountOrderList, "Account orders retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userData?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the account orders " + String(error), 500);
  }
}
