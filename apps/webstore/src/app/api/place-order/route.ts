import { placeOrder } from "@znode/agents/checkout";
import { sendError, sendSuccess } from "@znode/utils/server";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { placeOrderFromQuote } from "@znode/agents/account";

export async function POST(request: Request) {
  try {
    const { convertToOrderRequestModel, cartNumber, orderType } = (await request.json()) || {};

    let placeOrderData;
    switch (orderType) {
      case ORDER_DATA_TYPE.ORDER:
        placeOrderData = await placeOrder(convertToOrderRequestModel, cartNumber);
        break;
      case ORDER_DATA_TYPE.QUOTE:
        placeOrderData = await placeOrderFromQuote(convertToOrderRequestModel, cartNumber);
        break;
      default:
        return sendError("Invalid orderType provided", 400);
    }

    return sendSuccess(placeOrderData);
  } catch (error) {
    return sendError("An error occurred while placing the order. " + String(error), 500);
  }
}
