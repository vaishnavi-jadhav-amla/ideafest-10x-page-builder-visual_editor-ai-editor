import { sendError, sendSuccess } from "@znode/utils/server";

import { orderHistory } from "@znode/agents/account/order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize"));
    const pageIndex = Number(searchParams.get("pageIndex"));
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const currentFilters = JSON.parse(currentFiltersString ?? "");
    const sortValues = JSON.parse(sortValue ?? "");
    const orderHistoryData = await orderHistory(pageSize, pageIndex, sortValues, currentFilters);
    return sendSuccess(orderHistoryData, "Order history retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the list of order history. " + String(error), 500);
  }
}
