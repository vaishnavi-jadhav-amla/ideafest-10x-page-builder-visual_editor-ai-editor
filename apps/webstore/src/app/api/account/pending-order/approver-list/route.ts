import { sendError, sendSuccess } from "@znode/utils/server";
import { getApproverList } from "@znode/agents/account";
import { getSavedUserSession } from "@znode/utils/common";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const userData = await getSavedUserSession();
    if (userData?.userId && orderNumber) {
      const approverList = await getApproverList(orderNumber);
      return sendSuccess(approverList);
    } else {
      return sendError(`Invalid User ID ${userData?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the list of associated approvers. " + String(error), 500);
  }
}
