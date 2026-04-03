import { ISavedCartItems, ISavedCartTemplate } from "@znode/types/account";
import { httpRequest } from "../../base";

export const editSaveCartName = async (props: ISavedCartItems) => {
  const updatedQuantity = await httpRequest<ISavedCartTemplate>({ endpoint: "/api/account/saved-cart/edit-saved-cart-name", method: "PUT", body: props });
  return updatedQuantity;
};
