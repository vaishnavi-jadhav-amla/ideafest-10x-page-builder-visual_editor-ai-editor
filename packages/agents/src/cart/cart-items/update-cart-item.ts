import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IUpdateCartRequest, IUpdatedCartResponse } from "@znode/types/cart";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { CommerceCollections_quantity } from "@znode/clients/cp";

/**
 * Updates the quantity of a specified item in the cart.
 *
 * @param cartNumber - The unique identifier of the cart.
 * @param cartItemId - The unique identifier of the cart item to be updated.
 * @param updateRequest - The request object containing the update details.
 * @returns A promise that resolves to the updated cart item data, or null if an error occurs.
 */
export async function updateCartItem(classType: string, cartNumber: string, cartItemId: string, updateRequest: IUpdateCartRequest): Promise<IUpdatedCartResponse | null> {
  try {
    const updatedCartItem = await CommerceCollections_quantity(classType, cartNumber, cartItemId, convertPascalCase(updateRequest));
    const updatedCartItemData = convertCamelCase(updatedCartItem);

    return updatedCartItemData as IUpdatedCartResponse;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return null;
  }
}
