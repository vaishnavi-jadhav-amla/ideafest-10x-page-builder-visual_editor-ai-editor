import { IAddToTemplateRequestModel, ITemplateCartItems } from "@znode/types/account";
import { httpRequest } from "../../base";

export const addMultipleProductsToOrderTemplate = async (addToTemplateModel: IAddToTemplateRequestModel[]): Promise<ITemplateCartItems[]> => {
  const addToTemplateResponse = await httpRequest<ITemplateCartItems[]>({ endpoint: "/api/account/order-template/add-multiple-products", body: addToTemplateModel });
  return addToTemplateResponse;
};
