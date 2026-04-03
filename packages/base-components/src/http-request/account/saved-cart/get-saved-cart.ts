import { httpRequest } from "../../base";
import { ISavedCartList } from "@znode/types/account/saved-cart";

export const getSavedCart = async () => {
  const savedCartList = await httpRequest<ISavedCartList>({
    endpoint: "/api/account/saved-cart/get-saved-cart",
  });
  return savedCartList;
};
