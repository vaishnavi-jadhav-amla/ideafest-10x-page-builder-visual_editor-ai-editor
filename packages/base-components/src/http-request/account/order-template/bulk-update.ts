import { IBulkQuantity, IUpdateBulkItemQuantityResponse } from "@znode/types/account";
import { httpRequest } from "../../base";
export const bulkQuantityUpdate = async (bulkQuantityModel: IBulkQuantity): Promise<IUpdateBulkItemQuantityResponse> => {
  const updateItemQuantityResponse = await httpRequest<IUpdateBulkItemQuantityResponse>({
    endpoint: "/api/account/order-template/bulk-update",
    method: "PUT",
    body: { bulkQuantityModel },
  });
  return updateItemQuantityResponse;
};
