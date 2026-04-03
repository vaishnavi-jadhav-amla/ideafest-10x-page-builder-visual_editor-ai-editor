import { httpRequest } from "../base";
import { objectToQueryString } from "@znode/utils/component";

export const removeAllItems = async (props: { cartType: string; cartNumber: string }) => {
  const queryString: string = objectToQueryString(props);
  const removeAllResponse = await httpRequest<boolean>({ endpoint: `/api/cart/remove-all-cart-items?${queryString}`, method: "DELETE" });
  return removeAllResponse;
};
