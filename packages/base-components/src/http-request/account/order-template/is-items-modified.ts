import { httpRequest } from "../../base";
import { ITemplateCartItems } from "@znode/types/account";

export const isOrderTemplateItemsModified = async (templateLineItems: ITemplateCartItems[], classNumber: string): Promise<boolean> => {
  const orderTemplateItemsModifiedResponse = await httpRequest<boolean>({
    endpoint: "/api/account/order-template/is-items-modified",
    method: "POST",
    body: { templateLineItems: templateLineItems, classNumber: classNumber },
  });
  return orderTemplateItemsModifiedResponse;
};
