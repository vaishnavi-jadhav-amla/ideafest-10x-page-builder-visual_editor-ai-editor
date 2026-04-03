import { sendError, sendSuccess } from "@znode/utils/server";

import { PAGINATION } from "@znode/constants/pagination";
import { getReviewList } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize")) || PAGINATION.DEFAULT_TABLE_PAGE_SIZE;
    const pageNumber = Number(searchParams.get("pageNumber")) || PAGINATION.DEFAULT_TABLE_PAGE_INDEX;
    const userData = await getSavedUserSession();
    const userId = userData?.userId;

    if (userId) {
      const reviewHistoryList = await getReviewList(pageSize, pageNumber);
      return sendSuccess(reviewHistoryList, "Review history retrieved successfully.");
    } else {
      return sendError(`Invalid User ID ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of review history. " + String(error), 500);
  }
}
