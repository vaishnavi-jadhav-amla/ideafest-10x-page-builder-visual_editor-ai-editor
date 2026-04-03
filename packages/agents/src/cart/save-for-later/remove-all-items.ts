import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_removeAllByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";

/**
 * Removes all items from the "Save for Later" cart.
 *
 * @param cartNumber - The unique identifier of the "Save for Later" cart from which all items should be removed.
 * @returns A promise that resolves to a boolean indicating the success of the operation.
 *          Returns true if all items were successfully removed, false otherwise.
 */
export async function removeAllItemsFromSaveForLaterCart(cartNumber: string): Promise<boolean> {
  try {
    const response = await CommerceCollections_removeAllByClassType(ORDER_DATA_TYPE.SAVE_FOR_LATER, cartNumber);

    const formattedResponse = convertCamelCase(response);

    return formattedResponse.isSuccess || false;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return false;
  }
}
