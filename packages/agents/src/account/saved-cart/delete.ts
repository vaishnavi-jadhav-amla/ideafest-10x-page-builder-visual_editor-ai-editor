import { CLASSTYPE } from "@znode/constants/checkout";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { MultipleDeleteResponseModel } from "packages/clients/src/types/interface";
import { CommerceCollections_v1ByClassType } from "packages/clients/src/znode-client/commerce/commerce-collections";

export async function deleteSavedCart(classNumber: string) {
  try {
    if (!classNumber) return handleSavedCartDeleteFailure();
    const deletedResponse = await CommerceCollections_v1ByClassType(CLASSTYPE.SAVED_CARTS, classNumber);

    if (deletedResponse) {
      return isAllDeleted(deletedResponse);
    } else {
      return handleSavedCartDeleteFailure();
    }
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return false;
  }
}

export function handleSavedCartDeleteFailure() {
  logServer.error(AREA.SAVED_CART, "Failed to delete saved cart.");
  return false;
}

export function isAllDeleted(multipleDeleteResponse: MultipleDeleteResponseModel): boolean {
  if (!multipleDeleteResponse.DeletedItems || multipleDeleteResponse.DeletedItems?.length === 0) {
    return false;
  }

  return multipleDeleteResponse.DeletedItems.every((item) => item.IsSuccess === true);
}
