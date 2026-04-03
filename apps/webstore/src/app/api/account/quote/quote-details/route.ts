import { getUserQuoteDetails } from "@znode/agents/account/quote";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { getSavedUserSession } from "@znode/utils/common";
import { sendSuccess, sendError } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderType = searchParams.get("orderType");
    const quoteNumber = searchParams.get("quoteNumber");
    const userSession = await getSavedUserSession();
    const userId = userSession?.userId;

    if (userId) {
      if (orderType === ORDER_DATA_TYPE.QUOTE) {
        if (quoteNumber) {
          const orderDetails = await getUserQuoteDetails(quoteNumber);
          return sendSuccess(orderDetails, "quote details retrieved successfully.");
        } else {
          return sendError(`Invalid order number ${quoteNumber}.`, 400);
        }
      } else {
        return sendError(`Invalid order type ${orderType}.`, 400);
      }
    } else {
      return sendError(`Invalid User ID ${userSession && userSession.userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the details of quote. " + String(error), 500);
  }
}
