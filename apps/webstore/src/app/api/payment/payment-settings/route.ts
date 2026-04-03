import { getPaymentSettingByUserDetailsFromCache } from "@znode/agents/payment";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST() {
  try {
    const currentUser = await getSavedUserSession();
    if (currentUser && currentUser.userId) {
      const paymentModel = await getPaymentSettingByUserDetailsFromCache(currentUser.userId);
      return sendSuccess(paymentModel);
    } else {
      return sendError(`Invalid User ID ${currentUser?.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching payment settings. " + String(error), 500);
  }
}
