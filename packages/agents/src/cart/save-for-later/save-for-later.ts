import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_itemListByClassType } from "@znode/clients/cp";
import { ICart } from "@znode/types/cart";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";
import { mappedCartItems } from "../mapper";

export async function getSaveForLaterItems(cartNumber: string) {
  try {
    if (cartNumber) {
      const savedCartItems = await CommerceCollections_itemListByClassType(ORDER_DATA_TYPE.SAVE_FOR_LATER, cartNumber);
      const savedCartData = convertCamelCase(savedCartItems);
      const cart: ICart = {
        cartNumber: savedCartData.cartNumber,
        cartItems: mappedCartItems(savedCartData.itemList),
      };

      return cart;
    }
    return handleSaveForLaterItemsFailure;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return getSaveForLaterItemsFailureResponse();
  }
}

function handleSaveForLaterItemsFailure() {
  logServer.error(AREA.CART, "Failed to get save for later items.");
  return getSaveForLaterItemsFailureResponse();
}

function getSaveForLaterItemsFailureResponse() {
  const cart = {
    cartNumber: null,
    cartItems: [],
  };
  return cart as ICart;
}
