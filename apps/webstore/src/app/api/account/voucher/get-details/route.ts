import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { SETTINGS } from "@znode/constants/settings";
import { getSavedUserSession } from "@znode/utils/common";
import { getVoucherDetails } from "@znode/agents/account/voucher";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize") || SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
    const pageIndex = Number(searchParams.get("pageIndex") || SETTINGS.DEFAULT_TABLE_PAGE_INDEX);
    const sortValue = searchParams.get("sortValue");
    const sortValues = JSON.parse(sortValue || "");
    const voucherId = Number(searchParams.get("cardId") || 0);
    const voucherNumber = searchParams.get("voucherNumber");
    const portalHeader = await getPortalHeader();
    const user = await getSavedUserSession();
    const userId: number = user?.userId || 0;
    if (userId) {
      const voucherDetails = await getVoucherDetails(voucherId, userId, portalHeader?.portalId, pageSize, pageIndex, sortValues, voucherNumber as string);
      return sendSuccess(voucherDetails, "Voucher details retrieved successfully.");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the details of voucher.  " + String(error), 500);
  }
}
