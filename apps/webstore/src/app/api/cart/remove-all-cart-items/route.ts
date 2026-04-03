import { removeAllItemsFromCart, removeAllItemsFromSaveForLaterCart } from "@znode/agents/cart";
import { sendError, sendSuccess } from "@znode/utils/server";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { removeAllItemsFromSavedCart } from "@znode/agents/account/saved-cart";

/**
 * Handles the DELETE request to remove all items from a specified cart or a "save for later" cart.
 *
 * This function extracts the `cartNumber` and `cartType` from the request's URL parameters.
 * It checks if the cartNumber is provided; if not, it responds with an error indicating that
 * the cart number is required. Depending on the `cartType`, it calls the appropriate function
 * to remove all items from either the save for later cart or the regular cart.
 *
 * If the operation is successful, it returns a success message. If it fails, it returns an error
 * message specifying the failure reason. In the event of any unexpected errors, a generic error
 * message is returned.
 *
 * @param {Request} request - The incoming DELETE request object containing URL parameters.
 * @returns {Promise<Response>} - A promise that resolves to a Response object indicating the
 * result of the delete operation. The response can indicate success or failure based on the
 * outcome of the deletion attempts.
 *
 * @throws {Error} - Throws an error if an unexpected issue occurs during the execution of the request.
 *
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartNumber = searchParams.get("cartNumber");
    const cartType = searchParams.get("cartType");

    if (!cartNumber) {
      return sendError("Cart number is required.", 400);
    }

    if (cartType === ORDER_DATA_TYPE.SAVE_FOR_LATER) {
      const isCartItemDeleted = await removeAllItemsFromSaveForLaterCart(cartNumber || "");
      return isCartItemDeleted
        ? sendSuccess(isCartItemDeleted, "Save for later cart items deleted successfully.")
        : sendError(`Failed to delete items from save for later cart: ${cartNumber}`, 500);
    } else if (cartType === ORDER_DATA_TYPE.CARTS || ORDER_DATA_TYPE.ORDER_TEMPLATE) {
      const isCartItemDeleted = await removeAllItemsFromCart(cartType || "", cartNumber || "");
      return isCartItemDeleted ? sendSuccess(isCartItemDeleted, "Cart items deleted successfully.") : sendError(`Failed to delete items from cart: ${cartNumber}`, 500);
    } else if (cartType === ORDER_DATA_TYPE.SAVED_CARTS) {
      const isCartItemDeleted = await removeAllItemsFromSavedCart(cartNumber || "");
      return isCartItemDeleted ? sendSuccess(isCartItemDeleted, "Cart items deleted successfully.") : sendError(`Failed to delete items from cart: ${cartNumber}`, 500);
    }
  } catch (error) {
    return sendError("An error occurred while deleting cart items:" + String(error), 500);
  }
}
