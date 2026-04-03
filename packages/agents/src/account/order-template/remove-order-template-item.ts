import { CommerceCollections_deleteItemByClassType } from "@znode/clients/cp";
import { CLASSTYPE } from "@znode/constants/checkout";
import { AREA, errorStack, logServer } from "@znode/logger/server";

export async function removeItemFromOrderTemplate(classNumber: string, itemId: string): Promise<boolean> {
  try {
    const removeItemResponse = await CommerceCollections_deleteItemByClassType(CLASSTYPE.ORDER_TEMPLATE, classNumber, itemId);
    if (removeItemResponse) {
      return removeItemResponse.IsSuccess || false;
    } else {
      logServer.error(AREA.ORDER_TEMPLATES, errorStack("Unexpected error occurred."));
      return false;
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return false;
  }
}
