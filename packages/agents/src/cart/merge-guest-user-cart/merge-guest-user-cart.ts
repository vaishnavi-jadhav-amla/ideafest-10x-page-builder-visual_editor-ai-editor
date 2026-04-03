import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IMergeCartRequest, IMergeCartResponse } from "@znode/types/user";

import { Carts_mergeCart } from "@znode/clients/cp";
import { convertPascalCase } from "@znode/utils/server";
import { getCartCount } from "../cart-count/cart-count";
import { getCartNumber } from "../cart-number/cart-number";

export async function mergeGuestUserCart(mergeCartRequest: IMergeCartRequest, userId: number) {
  try {
    if (!(mergeCartRequest?.guestUserCartNumber && userId)) {
      return handleMergeGuestUserCartFailure();
    }
    const loginUserCartNumber = await getCartNumber(userId);
    mergeCartRequest.loginUserCartNumber = loginUserCartNumber ? loginUserCartNumber : "";
    const response = await Carts_mergeCart(convertPascalCase(mergeCartRequest));
    const mergedCartNumber = response?.MergedCartNumber && typeof response.MergedCartNumber === "string" ? response.MergedCartNumber : undefined;
    const cartCount = mergedCartNumber ? await getCartCount(mergedCartNumber, "Merge Cart") : 0;

    const mergeCartResponse: IMergeCartResponse = {
      mergedCartNumber: mergedCartNumber,
      cartCount: cartCount,
    };

    return mergeCartResponse;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return getMergeGuestUserCartModel();
  }
}

export function handleMergeGuestUserCartFailure(): IMergeCartResponse {
  logServer.error(AREA.CART, "Failed to merge guest user cart.");
  return getMergeGuestUserCartModel();
}

export function getMergeGuestUserCartModel(): IMergeCartResponse {
  const mergeCartResponse: IMergeCartResponse = {
    mergedCartNumber: undefined,
    cartCount: 0,
  };
  return mergeCartResponse;
}
