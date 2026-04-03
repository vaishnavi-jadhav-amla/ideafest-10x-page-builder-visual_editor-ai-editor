import { sendError, sendSuccess } from "@znode/utils/server";

import { SETTINGS } from "@znode/constants/settings";
import { getSavedUserSession } from "@znode/utils/common";
import { getVoucherHistory } from "@znode/agents/account";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize") ?? SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
    const pageIndex = Number(searchParams.get("pageIndex") ?? SETTINGS.DEFAULT_TABLE_PAGE_INDEX);
    const sortValue = JSON.parse(searchParams.get("sortValue") || "");
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      const giftCardList = await getVoucherHistory(pageSize, pageIndex, sortValue, userId);
      return sendSuccess(giftCardList, "Voucher history retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of voucher history. " + String(error), 500);
  }
}
