import { CART_COOKIE } from "@znode/constants/cookie";
import { getCookie, setCookie } from "@znode/utils/component";
import { httpRequest } from "../base";

export const getCartNumber = async () => {
  let cartNumber = getCookie(CART_COOKIE.CART_NUMBER);
  if (!cartNumber) {
    cartNumber = await httpRequest<string>({ endpoint: "/api/cart/get-cart-number" });
    if (cartNumber && typeof cartNumber === "string") {
      setCookie(CART_COOKIE.CART_NUMBER, cartNumber);
    }
  }
  return cartNumber;
};
