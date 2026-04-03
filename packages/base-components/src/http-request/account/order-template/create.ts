import { ICreateOrderTemplate, ICreateTemplateResponse } from "@znode/types/account";

import { httpRequest } from "../../base";

export const createOrderTemplate = async (createOrderTemplateModel: ICreateOrderTemplate): Promise<ICreateTemplateResponse> => {
  const response = await httpRequest<ICreateTemplateResponse>({
    endpoint: "/api/account/order-template/create",
    method: "POST",
    body: createOrderTemplateModel,
  });
  return response;
};
