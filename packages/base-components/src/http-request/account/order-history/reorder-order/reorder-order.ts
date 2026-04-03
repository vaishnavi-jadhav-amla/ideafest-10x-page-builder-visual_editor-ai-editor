import { IReorderRequestModel } from "@znode/types/order";
import { httpRequest } from "../../../base";

export const reorderOrder = async (reorderRequestModel: IReorderRequestModel): Promise<boolean> => {
  const reorderStatus = await httpRequest<boolean>({ endpoint: "/api/account/order/re-order", body: reorderRequestModel });
  return reorderStatus;
};
