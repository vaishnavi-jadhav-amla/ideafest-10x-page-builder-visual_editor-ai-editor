import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { IAddToCart } from "@znode/types/cart";
import { IPortalDetail } from "@znode/types/portal";
import { IUser } from "@znode/types/user";
import { ShoppingCart_getShoppingCart } from "@znode/clients/v1";
import { getPortalDetails } from "../portal";
import { getSavedUserSession } from "@znode/utils/common";

/**
 * @deprecated This function is deprecated.
 * Please use `packages/base-components/src/http-request/cart/get-cart-items.ts` to get cart items,
 * and `api/cart/cart-summary` to retrieve cart calculations.
 */

export function mapNewAddToCartModel(user: IUser | undefined, portalData?: IPortalDetail, cookieMappingId?: string): IAddToCart {
  const addToCartModel: IAddToCart = {
    publishedCatalogId: portalData?.publishCatalogId,
    userId: user?.userId || 0,
    localeId: portalData?.localeId || 0,
    portalId: portalData?.portalId || 0,
    shoppingCartItems: [],
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  cookieMappingId !== "undefined" && cookieMappingId !== null && cookieMappingId?.trim() !== "" ? (addToCartModel.cookieMappingId = cookieMappingId) : null;
  return addToCartModel;
}

/**
 * @deprecated This function is deprecated.
 */
export async function getShoppingCart(portalData?: IPortalDetail, cookieMappingId?: string) {
  try {
    const portalData = await getPortalDetails();
    const user = await getSavedUserSession();
    const cartModel: IAddToCart = mapNewAddToCartModel(user as IUser, portalData, cookieMappingId);
    const shoppingCart = await ShoppingCart_getShoppingCart(convertPascalCase(cartModel));
    const shoppingCartResponse = convertCamelCase(shoppingCart);
    if (shoppingCartResponse?.hasError) throw new Error(shoppingCartResponse?.errorMessage) || {};
    return shoppingCartResponse?.shoppingCart;
  } catch (error) {
    logServer.error(AREA.ADDRESS, errorStack(error));
    return { HasError: true } as IAddToCart;
  }
}
