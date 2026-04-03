import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../../base";
import { IOrderTemplate } from "@znode/types/account";

export const getOrderTemplateItems = async (classNumber: string): Promise<IOrderTemplate> => {
  const queryString: string = objectToQueryString({ classNumber: classNumber });
  const OrderTemplateItemList = await httpRequest<IOrderTemplate>({
    endpoint: `/api/account/order-template/get-items?${queryString}`,
  });
  return OrderTemplateItemList;
};
