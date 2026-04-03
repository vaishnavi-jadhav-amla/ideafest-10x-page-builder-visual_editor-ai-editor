import { ICart } from "@znode/types/cart";
import { httpRequest } from "../base";

export const getSaveForLaterItems = async (cartNumber: string) => {
  const cardModel = await httpRequest<ICart>({ endpoint: `/api/cart/get-save-for-later-items?cartNumber=${cartNumber}` });
  return cardModel;
};
