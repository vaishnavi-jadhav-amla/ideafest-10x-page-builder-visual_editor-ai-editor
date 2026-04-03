import { IUpdatedOrderStatus } from "@znode/types/account";
import { httpRequest } from "../../../base";

export const updateOrderStatus = async (props: { orderType: string; orderNumber: string; status: string }): Promise<IUpdatedOrderStatus> => {
  const updatedStatus = await httpRequest<IUpdatedOrderStatus>({
    endpoint: "/api/account/pending-order/update-order-status",
    method: "PUT",
    body: props,
  });
  return updatedStatus;
};
