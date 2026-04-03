import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IAddToCartRequest, IAddToCartResponse } from "@znode/types/cart";

import { Carts_addToCart } from "@znode/clients/cp";
import { IUser } from "@znode/types/user";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import { convertPascalCase } from "@znode/utils/server";
import { getCartCount } from "./cart-count/cart-count";
import { getCatalogCode } from "../category";
import { getPortalDetails } from "../portal";

export async function addToCartProduct(addToCartRequest: IAddToCartRequest, userDetails: IUser | null): Promise<IAddToCartResponse> {
  try {
    if (!addToCartRequest) return handleAddToCartFailure();
    addToCartRequest.orderOrigin = ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN;
    addToCartRequest.notes = "";
    const portalData = await getPortalDetails();

    addToCartRequest.catalogCode = await getCatalogCode(portalData, userDetails || undefined);
    const response = await Carts_addToCart(convertPascalCase(addToCartRequest));
    if (!response) {
      return handleAddToCartFailure();
    }

    if (response?.Status) {
      const cartCount = response?.CartNumber ? await getCartCount(response.CartNumber, "Add to Cart") : 0;
      const addToCartResponse = {
        cartId: response.CartId,
        addToCartStatus: response.Status,
        cartNumber: response.CartNumber,
        cartCount: cartCount,
      } as IAddToCartResponse;

      return addToCartResponse;
    } else {
      return handleAddToCartFailure();
    }
  } catch (error) {
    logServer.error(AREA.ADD_TO_CART, errorStack(error));
    return handleAddToCartFailure();
  }
}

export function handleAddToCartFailure() {
  logServer.error(AREA.ADD_TO_CART, "Failed to Add to Cart Product.");
  return { addToCartStatus: false } as IAddToCartResponse;
}
