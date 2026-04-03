import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_itemListByClassType } from "@znode/clients/cp";
import { ICart } from "@znode/types/cart";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";
import { mappedCartItems } from "../mapper";

export async function getCartItems(cartNumber: string) {
  try {
    if (cartNumber) {
      const cartDetails = await CommerceCollections_itemListByClassType(ORDER_DATA_TYPE.CARTS, cartNumber);
      const cartData = convertCamelCase(cartDetails);
      if (cartData?.hasError) {
        return handleGetCartItemsFailure();
      }

      const cart: ICart = {
        cartNumber: cartData.classNumber,
        cartItems: mappedCartItems(cartData.itemList),
      };

      cart.isUnAssociatedProductEntity = cart.cartItems?.some((item) => item.hasValidationErrors === true) ?? false;
      return cart;
    }
    return handleGetCartItemsFailure();
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return getCartItemsFailureResponse();
  }
}

function handleGetCartItemsFailure() {
  logServer.error(AREA.CART, "Failed to get cart items.");
  return getCartItemsFailureResponse();
}

function getCartItemsFailureResponse() {
  const cart = {
    cartNumber: null,
    cartItems: [],
  };
  return cart as ICart;
}
