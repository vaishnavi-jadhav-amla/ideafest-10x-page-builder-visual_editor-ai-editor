import { CommerceCollections_status } from "@znode/clients/cp";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IUpdatedOrderStatus } from "@znode/types/account";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

export async function updateQuoteStatus(orderType: string, quoteNumber: string, statusCode: string): Promise<IUpdatedOrderStatus | null> {
  try {
    const requestModel = { statusCode: statusCode };
    const status = await CommerceCollections_status(orderType, quoteNumber, convertPascalCase(requestModel));
    const statusResponse: IUpdatedOrderStatus = convertCamelCase(status);
    return statusResponse;
  } catch (error) {
    logServer.error(AREA.PENDING_ORDER, errorStack(error));
    return { isSuccess: false } as IUpdatedOrderStatus;
  }
}
