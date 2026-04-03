import { httpRequest } from "../../base";

export const getCartCount = async (cartNumber: string, initiator?: string) => {
  const cartCount = await httpRequest<number>({ endpoint: `/api/cart/cart-count?cartNumber=${cartNumber}&initiator=${initiator}` });
  return cartCount;
};
