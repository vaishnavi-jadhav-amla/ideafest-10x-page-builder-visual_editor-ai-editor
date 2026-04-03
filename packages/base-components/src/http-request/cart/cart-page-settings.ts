import { ICartSettings } from "@znode/types/cart";
import { httpRequest } from "../base";

export const cartPageSettings = async () => {
  const cardModel = await httpRequest<ICartSettings>({ endpoint: "/api/cart/cart-page-settings" });
  return cardModel;
};
