import { IConvertToOrder, IConvertedToOrderResponse } from "@znode/types/checkout";

import { httpRequest } from "../base";

export const processOrder = async (convertToOrderRequestModel: IConvertToOrder, cartNumber: string, orderType: string) => {
  const requestPayload = {
    convertToOrderRequestModel: convertToOrderRequestModel,
    cartNumber,
    orderType,
  };
  const response = await httpRequest<IConvertedToOrderResponse>({ endpoint: "/api/place-order", method: "POST", body: requestPayload });
  return response;
};
