import { ORDER, ORDER_DATA_TYPE } from "@znode/constants/order";
import { sendError, sendSuccess } from "@znode/utils/server";

import { getPortalDetails } from "@znode/agents/portal/portal";
import { orderHistory } from "@znode/agents/account";
import { stringToBoolean } from "@znode/utils/common";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderType = searchParams.get("orderType");
    const pageSize = Number(searchParams.get("pageSize"));
    const pageIndex = Number(searchParams.get("pageIndex"));
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const accountId = searchParams.get("accountId");

    const currentFilters = JSON.parse(currentFiltersString ?? "");
    const sortValues = JSON.parse(sortValue ?? "");

    const portalData = await getPortalDetails();
    const isEnableReturnRequest = portalData?.globalAttributes?.find((a) => a.attributeCode?.toLowerCase() === ORDER.ENABLE_RETURN_REQUEST.toLowerCase())?.attributeValue || "";

    if (orderType === ORDER_DATA_TYPE.ORDER) {
      const orderList = await orderHistory(accountId, pageSize, pageIndex, stringToBoolean(isEnableReturnRequest), sortValues, currentFilters);
      return sendSuccess(orderList, "Order type data retrieved successfully.");
    }
  } catch (error) {
    return sendError("An error occurred while fetching the Order type data. " + String(error), 500);
  }
}
