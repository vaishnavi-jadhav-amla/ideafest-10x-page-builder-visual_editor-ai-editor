import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import { CommerceCollections_copy } from "packages/clients/src/znode-client/commerce/commerce-collections";
import { IOrderResponseData } from "@znode/types/account";
import { convertCamelCase } from "@znode/utils/server";
import { CLASSTYPE } from "@znode/constants/checkout";

export async function copySavedCartToCart(classNumber: string) {
  try {
    if (!classNumber) return handleCopyToCartFailure();
    const response = await CommerceCollections_copy(CLASSTYPE.SAVED_CARTS, classNumber, CLASSTYPE.CARTS, ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN);
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
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return getCopiedClassErrorModel();
  }
}

export function handleCopyToCartFailure() {
  logServer.error(AREA.SAVED_CART, "Failed to copy saved cart.");
  return getCopiedClassErrorModel();
}

function getCopiedClassErrorModel() {
  const copiedClassResponse: IOrderResponseData = {
    isSuccess: false,
    errorMessage: "",
  };
  return copiedClassResponse;
}
