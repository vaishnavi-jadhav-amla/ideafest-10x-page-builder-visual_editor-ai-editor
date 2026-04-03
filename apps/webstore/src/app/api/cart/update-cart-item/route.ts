import { convertPascalCase, sendError, sendSuccess } from "@znode/utils/server";

import { updateCartItem } from "@znode/agents/cart";

/**
 * Handles the PUT request to update the quantity of a cart item.
 *
 * @param {Request} request - The incoming PUT request containing cart details.
 * @returns {Promise<Response>} - A response indicating the success or failure of the update operation.
 *
 * @throws {Error} - If an error occurs during the update process.
 */
export async function PUT(request: Request) {
  try {
    const requestBody = await request.json();

    const updatePayload = {
      quantity: requestBody.updateCartQuantity,
      sku: requestBody.sku,
    };

    const updatedCartItem = await updateCartItem(requestBody.classType, requestBody.cartNumber, requestBody.cartItemId, convertPascalCase(updatePayload));
    return sendSuccess(updatedCartItem, `Cart item updated successfully with quantity ${requestBody.updateCartQuantity}.`);
  } catch (error) {
    return sendError("An error occurred while updating the cart item:" + String(error), 500);
  }
}
