import { httpRequest } from "../base";

export const getSaveForLaterId = async () => {
  const saveForLaterId = await httpRequest<string>({ endpoint: "/api/cart/get-save-for-later-id" });
  return saveForLaterId;
};
