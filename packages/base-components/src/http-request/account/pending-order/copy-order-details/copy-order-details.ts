import { IOrderResponseData } from "@znode/types/account";
import { httpRequest } from "../../../base";

export const copyOrderDetails = async (props: { orderType: string; orderNumber: string }): Promise<IOrderResponseData> => {
  const orderDetails = await httpRequest<IOrderResponseData>({
    endpoint: "/api/account/pending-order/copy-order-details",
    method: "POST",
    body: props,
  });
  return orderDetails;
};
