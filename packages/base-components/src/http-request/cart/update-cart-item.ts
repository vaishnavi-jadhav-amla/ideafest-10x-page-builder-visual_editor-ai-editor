import { ICartItems, IUpdateCartItemQuantityResponse } from "@znode/types/cart";

import { httpRequest } from "../base";

export const updateCartItemQuantity = async (props: ICartItems) => {
  const updatedQuantity = await httpRequest<IUpdateCartItemQuantityResponse>({ endpoint: "/api/cart/update-cart-item", method: "PUT", body: props });
  return updatedQuantity;
};
