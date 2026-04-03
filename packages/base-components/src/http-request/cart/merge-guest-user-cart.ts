import { IMergeCartRequest, IMergeCartResponse } from "@znode/types/user";
import { httpRequest } from "../base";

export const mergeGuestUserCart = async (mergeCartRequest: IMergeCartRequest): Promise<IMergeCartResponse> => {
  const mergeCartResponse = await httpRequest<IMergeCartResponse>({ endpoint: "/api/cart/merge-guest-user-cart", method: "POST", body: mergeCartRequest });
  return mergeCartResponse;
};
