import { IAddToCartRequest, IAddToCartResponse } from "@znode/types/cart";

import { httpRequest } from "../base";

export const addToCart = async (props: IAddToCartRequest): Promise<IAddToCartResponse> => {
  const addToCartResponse = await httpRequest<IAddToCartResponse>({ endpoint: "/api/add-to-cart", body: props });
  return addToCartResponse;
};
  