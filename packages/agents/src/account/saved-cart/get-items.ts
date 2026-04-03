import { mappedCartItems } from "../../cart/mapper";
import { CLASSTYPE } from "@znode/constants/checkout";
import { ERROR_CODE } from "@znode/constants/error";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ISavedCartTemplate, ITemplateCartItems } from "@znode/types/account";
import { convertCamelCase } from "@znode/utils/server";
import { CommerceCollections_itemListByClassType } from "packages/clients/src/znode-client/commerce/commerce-collections";

export async function getSavedCartItems(classNumber: string) {
  try {
    if (!classNumber) return handleGetSavedCartItemsFailure();
    const savedCartDetails = await CommerceCollections_itemListByClassType(CLASSTYPE.SAVED_CARTS, classNumber);

    if (savedCartDetails) {
      const savedCartItemResponse = convertCamelCase(savedCartDetails);
      if (savedCartItemResponse && savedCartItemResponse.errorCode === ERROR_CODE.CART_ITEMS_ERROR_CODE) {
        return null;
      }
      const savedCart: ISavedCartTemplate = {
        className: savedCartItemResponse.className,
        itemList: mappedCartItems(savedCartItemResponse.itemList, true) as ITemplateCartItems[],
        classNumber: savedCartItemResponse.classNumber,
      };
      return savedCart;
    } else {
      return handleGetSavedCartItemsFailure();
    }
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return getSavedCartItemsFailureResponse();
  }
}

export function handleGetSavedCartItemsFailure() {
  logServer.error(AREA.SAVED_CART, "Failed to get saved cart items.");
  return getSavedCartItemsFailureResponse();
}

function getSavedCartItemsFailureResponse() {
  return {
    itemList: undefined,
    className: undefined,
  } as ISavedCartTemplate;
}
