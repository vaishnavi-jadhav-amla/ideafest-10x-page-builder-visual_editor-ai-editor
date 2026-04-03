import { CommerceCollections_copy } from "@znode/clients/cp";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IOrderResponseData } from "@znode/types/account";
import { convertCamelCase } from "@znode/utils/server";

export async function copyOrderDetails(orderNumber: string) {
  try {
    const orderData = await CommerceCollections_copy(ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber, ORDER_DATA_TYPE.ORDER, ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN);
    if (orderData) {
      const orderDetails: IOrderResponseData = convertCamelCase(orderData);
      return orderDetails;
    } else {
      return {
        copiedQuoteNumber: "",
        isSuccess: false,
      } as IOrderResponseData;
    }
  } catch (error) {
    logServer.error(AREA.PENDING_ORDER, errorStack(error));
    return {
      copiedQuoteNumber: "",
      isSuccess: false,
    } as IOrderResponseData;
  }
}
