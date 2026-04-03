import { ICart } from "@znode/types/cart";
import { httpRequest } from "../base";

export const getCartItems = async (cartNumber: string) => {
  const cardModel = await httpRequest<ICart>({ endpoint: `/api/cart/get-cart-items?cartNumber=${cartNumber}` });
  return cardModel;
};
