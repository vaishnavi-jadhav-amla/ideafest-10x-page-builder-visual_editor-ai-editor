import { IOrderStatusRequest } from "@znode/types/order-status";
import { httpRequest } from "../base";
import { IOrderDetails } from "@znode/types/account";

export const getOrderStatus = async (payload: IOrderStatusRequest) => {
  const orderStatusResponse = await httpRequest<IOrderDetails>({ endpoint: "/api/order-status", method: "POST", body: payload });
  return orderStatusResponse;
};
