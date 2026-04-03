import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_activeClassNumberByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

/**
 * Retrieves the active cart number for the specified user.
 *
 * This function takes a user ID as input and fetches the active cart number for the user by
 * calling `CommerceCollections_cartsActiveclassnumber`. If the user ID is invalid or an error
 * occurs during the fetch, an error is logged and the function returns null.
 *
 * @param {number} userId - The ID of the user for whom the cart number is being fetched.
 * @returns {Promise<string | null>} - The active cart number if found, or null if the user ID is invalid or no cart exists.
 *
 * - Logs an error if the user ID is invalid.
 * - If successful, returns the cart number; otherwise, logs the error and returns null.
 */
export async function getCartNumber(userId: number): Promise<string | null> {
  try {
    const activeClassResponse = await CommerceCollections_activeClassNumberByClassType(ORDER_DATA_TYPE.CARTS, userId);
    const cartNumber = activeClassResponse?.ClassNumber || "";
    return cartNumber;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return null;
  }
}
