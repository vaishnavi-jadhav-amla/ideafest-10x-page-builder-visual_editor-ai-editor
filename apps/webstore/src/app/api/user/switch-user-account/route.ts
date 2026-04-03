import { getUserDetailsByAccount } from "@znode/agents/user-account-list";
import { sendSuccess, sendError } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = Number(searchParams.get("accountId") || 0);
    const userName = searchParams.get("userName") || "";
    const userData = await getUserDetailsByAccount(userName, accountId);
    return sendSuccess(userData, "User details retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching user details.", 500);
  }
}
