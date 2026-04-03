import { CommerceCollections_status } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IUpdatedOrderStatus } from "@znode/types/account";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

export async function updateOrderStatus(orderNumber: string, statusCode: string) {
  try {
    const requestModel = { statusCode: statusCode };
    const status = await CommerceCollections_status(ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber, convertPascalCase(requestModel));
    const statusResponse: IUpdatedOrderStatus = convertCamelCase(status);
    return statusResponse;
  } catch (error) {
    logServer.error(AREA.PENDING_ORDER, errorStack(error));
    return { isSuccess: false } as IUpdatedOrderStatus;
  }
}
