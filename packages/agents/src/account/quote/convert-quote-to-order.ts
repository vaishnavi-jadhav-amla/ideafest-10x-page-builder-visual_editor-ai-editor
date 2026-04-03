import { IConvertToOrder, IConvertedToOrderResponse } from "@znode/types/account";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { CommerceCollections_placeOrder } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { getParentUserId } from "../../checkout/checkout";

// Converts a quote to an order and places it using the provided copiedQuoteNumber.
export async function placeOrderFromQuote(convertToOrderRequestModel: IConvertToOrder, cartNumber: string) {
  if (convertToOrderRequestModel && cartNumber) {
    const userId = await getParentUserId();
    const placeOrderResponse = await CommerceCollections_placeOrder(ORDER_DATA_TYPE.QUOTE, cartNumber, convertPascalCase(convertToOrderRequestModel), userId);
    return convertCamelCase(placeOrderResponse);
  } else {
    const errorPlaceOrderResponse: IConvertedToOrderResponse = { isSuccess: false };
    return errorPlaceOrderResponse;
  }
}
