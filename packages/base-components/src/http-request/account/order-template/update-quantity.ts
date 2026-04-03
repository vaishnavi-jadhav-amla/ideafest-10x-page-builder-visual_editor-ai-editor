import { IAddToTemplateRequestModel, ITemplateCartItems } from "@znode/types/account";
import { httpRequest } from "../../base";

export const updateTemplateItemQuantity = async (updateOrderTemplateModel: IAddToTemplateRequestModel): Promise<ITemplateCartItems> => {
  const orderDetails = await httpRequest<ITemplateCartItems>({
    endpoint: "/api/account/order-template/update-quantity",
    method: "POST",
    body: { updateOrderTemplateModel },
  });
  return orderDetails;
};
