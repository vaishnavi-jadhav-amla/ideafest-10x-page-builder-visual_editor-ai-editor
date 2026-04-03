import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getReturnList } from "@znode/agents/account/return-order/get-return-list";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize"));
    const pageIndex = Number(searchParams.get("pageIndex"));
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");

    if (!pageSize || !pageIndex || !sortValue || !currentFiltersString) {
      return sendError("Missing required parameters", 400);
    }
    const currentFilters = JSON.parse(currentFiltersString);
    const sortValues = JSON.parse(sortValue);
    const portalData = await getPortalHeader();
    const orderHistoryData = await getReturnList(pageSize, pageIndex, sortValues, currentFilters, portalData);
    const orderHistoryDetails = convertCamelCase(orderHistoryData);
    return sendSuccess(orderHistoryDetails, "Return order retrieved successfully.");
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return sendError("An error occurred while fetching the list of return order.", 500);
  }
}
