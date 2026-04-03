import { sendError, sendSuccess } from "@znode/utils/server";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertToQuote } from "@znode/agents/account/quote";
import { createSaveForLater } from "@znode/agents/cart/save-for-later/create-save-for-later";
import { moveToCartFromSaveForLater } from "@znode/agents/cart";
import { createSavedCart } from "@znode/agents/account/saved-cart";

/**
 * Handles HTTP PUT requests to move a cart item either to the "Save For Later" list or back to the cart.
 * The function processes the request based on the provided `classType` and moves the item accordingly.
 * @param {Request} request - The incoming HTTP request containing the cart and item details in JSON format.
 * @returns {Promise<Response | null>} - Returns a success response with the operation result if the item is successfully moved,
 * or an error response if an error occurs during processing or if the request data is invalid.
 * @throws {Error} - Logs and returns a 500 response in case of any server-side error during the operation.
 */
export async function PUT(request: Request): Promise<Response | null> {
  try {
    const { cartNumber, orderType, targetClassType, cartItemId, targetClassNumber = "", templateName, jobName, additionalInstruction } = (await request.json()) || {};

    let response;

    if (orderType === ORDER_DATA_TYPE.SAVE_FOR_LATER) {
      response = await createSaveForLater(cartNumber, targetClassType, cartItemId, targetClassNumber);
      return sendSuccess(response, "Moved cart item to save for later");
    } else if (orderType === ORDER_DATA_TYPE.MOVE_TO_CART) {
      response = await moveToCartFromSaveForLater(cartNumber, targetClassType, cartItemId);
      return sendSuccess(response, "Moved save for later cart item to cart");
    } else if (orderType === ORDER_DATA_TYPE.QUOTE) {
      response = await convertToQuote(cartNumber, targetClassType, jobName, additionalInstruction);
      return sendSuccess(response, "Quote create successfully");
    } else if (orderType === ORDER_DATA_TYPE.SAVED_CARTS) {
      response = await createSavedCart(cartNumber, targetClassType, cartItemId, targetClassNumber, templateName);
      return sendSuccess(response, "Saved cart create successfully");
    } else {
      return sendError("Invalid class type provided", 400);
    }
  } catch (error) {
    return sendError("An error occurred while moving Cart item: " + String(error), 500);
  }
}
