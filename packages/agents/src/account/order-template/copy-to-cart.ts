import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CLASSTYPE } from "@znode/constants/checkout";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import { CommerceCollections_copy } from "packages/clients/src/znode-client/commerce/commerce-collections";
import { IOrderResponseData } from "@znode/types/account";
import { convertCamelCase } from "@znode/utils/server";

export async function copyToCart(classNumber: string) {
  try {
    if (!classNumber) return handleCopyToCartFailure();
    const response = await CommerceCollections_copy(CLASSTYPE.ORDER_TEMPLATE, classNumber, CLASSTYPE.CARTS, ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN);
    if (response) {
      const formattedDetails: IOrderResponseData = convertCamelCase(response);
      const copiedClassResponse: IOrderResponseData = {
        copiedClassNumber: formattedDetails.copiedClassNumber,
        isSuccess: formattedDetails.isSuccess,
        errorMessage: formattedDetails.errorMessage,
      };
      return copiedClassResponse;
    } else {
      return handleCopyToCartFailure();
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return getCopiedClassErrorModel();
  }
}

export function handleCopyToCartFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to copy Order Templates.");
  return getCopiedClassErrorModel();
}

function getCopiedClassErrorModel() {
  const copiedClassResponse: IOrderResponseData = {
    isSuccess: false,
    errorMessage: "",
  };
  return copiedClassResponse;
}
