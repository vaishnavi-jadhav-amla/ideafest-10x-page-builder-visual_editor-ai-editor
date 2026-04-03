import { CLASSTYPE } from "@znode/constants/checkout";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { MultipleDeleteResponseModel } from "packages/clients/src/types/interface";
import { CommerceCollections_v1ByClassType } from "packages/clients/src/znode-client/commerce/commerce-collections";

export async function deleteOrderTemplate(classNumber: string) {
  try {
    if (!classNumber) return handleOrderTemplateCopyFailure();
    const response = await CommerceCollections_v1ByClassType(CLASSTYPE.ORDER_TEMPLATE, classNumber);
    if (response) {
      return areAllItemsSuccessfullyDeleted(response);
    } else {
      return handleOrderTemplateCopyFailure();
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return false;
  }
}

export function handleOrderTemplateCopyFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to copy Order Templates.");
  return false;
}

export function areAllItemsSuccessfullyDeleted(multipleDeleteResponse: MultipleDeleteResponseModel): boolean {
  if (!multipleDeleteResponse.DeletedItems || multipleDeleteResponse.DeletedItems?.length === 0) {
    return false;
  }

  return multipleDeleteResponse.DeletedItems.every((item) => item.IsSuccess === true);
}
