import { httpRequest } from "../base";

export const removeShippingByClassNumber = async (cartNumber: string): Promise<boolean> => {
  const removeShipping = await httpRequest<boolean>({ endpoint: `/api/remove-shipping-option?cartNumber=${cartNumber}`, method: "DELETE" });
  return removeShipping;
};
