import { httpRequest } from "../base";
import { objectToQueryString } from "@znode/utils/component";

export const removeSingleLineItem = async (props: { cartType: string; cartNumber: string; itemId: string }) => {
  const queryString: string = objectToQueryString(props);
  const removeItemResponse = await httpRequest<boolean>({ endpoint: `/api/cart/remove-cart-item?${queryString}`, method: "DELETE" });
  return removeItemResponse;
};
