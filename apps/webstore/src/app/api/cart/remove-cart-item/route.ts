import { removeItemFromCart, removeItemFromSaveForLaterCart } from "@znode/agents/cart";
import { sendError, sendSuccess } from "@znode/utils/server";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { removeItemFromOrderTemplate } from "@znode/agents/account/order-template/remove-order-template-item";
import { removeItemFromSavedCart } from "@znode/agents/account";

/**
 * Handles the deletion of items from either the main cart or the "Save for Later" cart.
 *
 * @param request - The HTTP request object containing the parameters for the deletion operation.
 * @returns A promise that resolves to a JSON response indicating the success or failure of the deletion operation.
 *          Returns a success message if the item is deleted successfully, or an error message if it fails.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartNumber = searchParams.get("cartNumber");
    const cartType = searchParams.get("cartType");
    const itemId = searchParams.get("itemId");

    switch (cartType) {
      case ORDER_DATA_TYPE.SAVE_FOR_LATER: {
        const isCartItemDeleted = await removeItemFromSaveForLaterCart(cartNumber || "", itemId || "");
        return isCartItemDeleted
          ? sendSuccess(isCartItemDeleted, "Save for later cart item deleted successfully.")
          : sendError(`Failed to delete item from save for later cart: ${cartNumber}`, 500);
      }

      case ORDER_DATA_TYPE.CARTS: {
        const isCartItemDeleted = await removeItemFromCart(cartNumber || "", itemId || "");
        return isCartItemDeleted ? sendSuccess(isCartItemDeleted, "Cart item deleted successfully.") : sendError(`Failed to delete item from cart: ${cartNumber}`, 500);
      }

      case ORDER_DATA_TYPE.ORDER_TEMPLATE: {
        const isCartItemDeleted = await removeItemFromOrderTemplate(cartNumber || "", itemId || "");
        return isCartItemDeleted
          ? sendSuccess(isCartItemDeleted, "Order Template item deleted successfully.")
          : sendError(`Failed to delete item from Order Template: ${cartNumber}`, 500);
      }

      case ORDER_DATA_TYPE.SAVED_CARTS: {
        const isCartItemDeleted = await removeItemFromSavedCart(cartNumber || "", itemId || "");
        return isCartItemDeleted
          ? sendSuccess(isCartItemDeleted, "Order Template item deleted successfully.")
          : sendError(`Failed to delete item from Order Template: ${cartNumber}`, 500);
      }

      default:
        return sendError("Invalid cart item type", 400);
    }
  } catch (error) {
    return sendError("An error occurred while deleting cart items: " + String(error), 500);
  }
}
