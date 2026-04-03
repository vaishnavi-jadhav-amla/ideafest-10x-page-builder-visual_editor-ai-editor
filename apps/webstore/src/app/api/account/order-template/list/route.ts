import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getOrderTemplateList } from "@znode/agents/account/order-template/list";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize"));
    const pageIndex = Number(searchParams.get("pageIndex"));
    const sortValue = searchParams.get("sortValue");
    const currentFiltersString = searchParams.get("currentFilters");
    const currentFilters = JSON.parse(currentFiltersString || "");
    const sortValues = JSON.parse(sortValue || "");
    const userDetails = await getSavedUserSession();

    const orderTemplateList = await getOrderTemplateList(userDetails?.userId, pageSize, pageIndex, sortValues, currentFilters);
    return sendSuccess(orderTemplateList, "Order templates retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the list of order template. " + String(error), 500);
  }
}
