import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../../base";
import { ISavedCartTemplate } from "@znode/types/account";

export const getSavedCartItems = async (classNumber: string): Promise<ISavedCartTemplate> => {
  const queryString: string = objectToQueryString({ classNumber: classNumber });
  const savedCartItemList = await httpRequest<ISavedCartTemplate>({
    endpoint: `/api/account/saved-cart/get-items?${queryString}`, 
  });
  return savedCartItemList;
};
