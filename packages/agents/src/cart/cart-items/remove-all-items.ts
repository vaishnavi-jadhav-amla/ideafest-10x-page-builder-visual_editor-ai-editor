import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_removeAllByClassType } from "@znode/clients/cp";
import { convertCamelCase } from "@znode/utils/server";

/**
 * Removes all items from the specified cart.
 *
 * @param cartNumber - The unique identifier of the cart from which all items should be removed.
 * @returns A promise that resolves to a boolean indicating the success of the operation.
 *          Returns true if all items were successfully removed, false otherwise.
 */
export async function removeAllItemsFromCart(classType: string, cartNumber: string): Promise<boolean> {
  try {
    const response = await CommerceCollections_removeAllByClassType(classType, cartNumber);

    const formattedResponse = convertCamelCase(response);

    return formattedResponse?.isSuccess || false;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return false;
  }
}
