import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getApproverActions, getApproverList } from "@znode/agents/account";

export async function POST(request: Request) {
  try {
    const requestObject = await request.json();
    const { orderNumber } = requestObject || {};
    const currentUser = await getSavedUserSession();
    const approverList = await getApproverList(orderNumber);
    if (currentUser && currentUser?.userId) {
      const approverACtions = getApproverActions(currentUser?.userName || "", approverList);
      return sendSuccess(approverACtions, "Got approver actions successfully.");
    } else {
      return sendError(`Invalid User ID ${currentUser?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while getting approver actions " + String(error), 500);
  }
}
