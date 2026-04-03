import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_removeAllByClassType } from "@znode/clients/cp";
import { convertCamelCase } from "@znode/utils/server";
import { CLASSTYPE } from "@znode/constants/checkout";

/**
 * Removes all items from the "SaveD Cart".
 *
 * @param cartNumber - The unique identifier of the "Save for Later" cart from which all items should be removed.
 * @returns A promise that resolves to a boolean indicating the success of the operation.
 *          Returns true if all items were successfully removed, false otherwise.
 */
export async function removeAllItemsFromSavedCart(cartNumber: string): Promise<boolean> {
  try {
    const response = await CommerceCollections_removeAllByClassType(CLASSTYPE.SAVED_CARTS, cartNumber);

    const formattedResponse = convertCamelCase(response);

    return formattedResponse.isSuccess || false;
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return false;
  }
}
