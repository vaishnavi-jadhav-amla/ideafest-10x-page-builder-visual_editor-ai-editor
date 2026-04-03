import { ICreateOrderTemplate, ICreateTemplateResponse } from "@znode/types/account";
import { httpRequest } from "../../base";

export const updateOrderTemplate = async (updateOrderTemplateModel: ICreateOrderTemplate): Promise<ICreateTemplateResponse> => {
  const orderDetails = await httpRequest<ICreateTemplateResponse>({
    endpoint: "/api/account/order-template/update",
    method: "POST",
    body: { updateOrderTemplateModel },
  });
  return orderDetails;
};
