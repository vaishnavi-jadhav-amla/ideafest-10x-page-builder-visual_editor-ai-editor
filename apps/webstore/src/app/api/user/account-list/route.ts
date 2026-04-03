import { getUserAccountList } from "@znode/agents/user-account-list";
import { sendSuccess, sendError } from "@znode/utils/server";
import { PAGINATION } from "@znode/constants/pagination";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountCode = searchParams.get("accountCode") || "";

    const searchTerm = decodeURIComponent(searchParams.get("searchTerm") || "");
    const pageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGINATION);
    const pageNumber = Number(searchParams.get("pageNumber") || PAGINATION.DEFAULT_TABLE_PAGE_INDEX);

    const userAccountList = await getUserAccountList(accountCode, pageNumber, pageSize, searchTerm);
    return sendSuccess(userAccountList, "User account list retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching parent child account list.", 500);
  }
}
