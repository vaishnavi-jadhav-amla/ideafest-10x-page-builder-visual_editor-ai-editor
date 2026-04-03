import { IGenerateFinalizeNumber } from "@znode/types/checkout" ;
import { httpRequest } from "../base";

export const generateFinalizeNumber = async (cartNumber: string) => {
  const response = await httpRequest<IGenerateFinalizeNumber>({ endpoint: `/api/place-order/finalize-number?cartNumber=${cartNumber}`, method: "PUT"});
  return response;
};
