import { checkStoreSettings } from "@znode/agents/portal";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { getSavedUserSession } from "@znode/utils/common";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const paymentCode = searchParams.get("paymentCode") ?? "";
    const currentUser = await getSavedUserSession();
    const { storeCode = "" } = await getPortalHeader();
    if (currentUser && currentUser?.userId) {
      const isApprovalOn = await checkStoreSettings(paymentCode, storeCode);
      return sendSuccess(isApprovalOn);
    } else {
      return sendError("Failed to retrieve the portal settings.", 500);
    }
  } catch (error) {
    logServer.error(AREA.PORTAL, errorStack(error));
    return sendError("Failed to retrieve the portal settings.", 500);
  }
}
