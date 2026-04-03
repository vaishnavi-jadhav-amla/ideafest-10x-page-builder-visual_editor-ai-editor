import { IConvertedClassResponse, ICreateCartRequest } from "@znode/types/cart";

import { httpRequest } from "../base";

export const create = async (props: ICreateCartRequest): Promise<IConvertedClassResponse> => {
  const convertedOrderDetails = await httpRequest<IConvertedClassResponse>({ endpoint: "/api/cart/create", method: "PUT", body: props });
  return convertedOrderDetails;
};
