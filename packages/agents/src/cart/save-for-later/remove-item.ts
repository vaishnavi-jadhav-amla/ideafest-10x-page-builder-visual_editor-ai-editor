import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_deleteItemByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";

/**
 * Removes a specific item from the "Save for Later" cart.
 *
 * @param cartNumber - The unique identifier of the "Save for Later" cart from which the item should be removed.
 * @param itemId - The unique identifier of the item to be removed from the cart.
 * @returns A promise that resolves to a boolean indicating the success of the operation.
 *          Returns true if the item was successfully removed, false otherwise.
 */
export async function removeItemFromSaveForLaterCart(cartNumber: string, itemId: string): Promise<boolean> {
  try {
    const response = await CommerceCollections_deleteItemByClassType(ORDER_DATA_TYPE.SAVE_FOR_LATER, cartNumber, itemId);

    const formattedResponse = convertCamelCase(response);

    return formattedResponse.isSuccess || false;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return false;
  }
}
