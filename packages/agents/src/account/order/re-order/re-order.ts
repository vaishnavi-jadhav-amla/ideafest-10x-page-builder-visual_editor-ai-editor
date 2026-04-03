import { AREA, errorStack, logServer } from "@znode/logger/server";

import { Orders_reorder } from "@znode/clients/cp";
import { IReorderRequestModel } from "@znode/types/order";
import { convertPascalCase } from "@znode/utils/server";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

export async function reorderOrder(reorderRequestModel: IReorderRequestModel): Promise<boolean> {
  try {
    if (!reorderRequestModel?.orderNumber) return handleReorderOrderFailure();

    const response = await Orders_reorder(ORDER_DATA_TYPE.ORDER, convertPascalCase(reorderRequestModel));
    if (response?.IsSuccess) {
      return true;
    }
    return false;
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return false;
  }
}

export function handleReorderOrderFailure() {
  logServer.error(AREA.ORDER, "Failed to reorder.");
  return false;
}
