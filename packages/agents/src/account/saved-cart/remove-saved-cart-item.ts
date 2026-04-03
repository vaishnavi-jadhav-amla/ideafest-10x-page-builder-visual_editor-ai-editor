import { CommerceCollections_deleteItemByClassType } from "@znode/clients/cp";
import { CLASSTYPE } from "@znode/constants/checkout";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase } from "@znode/utils/server";

export async function removeItemFromSavedCart(classNumber: string, itemId: string): Promise<boolean> {
  try {
    const removeItemResponse = await CommerceCollections_deleteItemByClassType(CLASSTYPE.SAVED_CARTS, classNumber, itemId);
    const formattedResponse = convertCamelCase(removeItemResponse);

    if (formattedResponse) {
      return formattedResponse.isSuccess || false;
    }
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return false;
  }
}
