import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { CommerceCollections_convert } from "@znode/clients/cp";
import { IConvertedClassResponse } from "@znode/types/cart";
import { CLASSTYPE } from "@znode/constants/checkout";

/**
 * Moves a cart item to a "Saved Cart" list by converting the cart and saving the item to a target list.
 *
 * @param {string} cartNumber - The current cart's number.
 * @param {string} targetClassType - The type of target class (e.g., saved for later).
 * @param {string} cartItemId - The ID of the item to be moved to save for later.
 * @param {string} targetClassNumber - The target list's number where the item will be saved for later.
 * @returns {Promise<ICreateCartResponse>} A promise that resolves with the updated cart information, including the new cart number.
 *
 * @throws Will log an error if the cart conversion or data transformation fails, and return a response with an undefined cartNumber.
 */
export async function createSavedCart(
  cartNumber: string,
  targetClassType: string,
  cartItemId: string,
  targetClassNumber: string,
  templateName: string
): Promise<IConvertedClassResponse> {
  try {
    if (!(cartNumber || cartItemId || targetClassType)) {
      return handleCreateSavedCartFailure();
    }

    const savedCartRequestModel = convertPascalCase({
      targetClassNumber: targetClassNumber,
      targetClassName: templateName,
      itemId: cartItemId,
      additionalInstructions: {
        name: "",
        information: "",
      },
    });

    const response = await CommerceCollections_convert(CLASSTYPE.SAVED_CARTS, cartNumber, targetClassType, savedCartRequestModel);
    const savedCartResponse = convertCamelCase(response);
     if (savedCartResponse?.statusCode === 409) {
    return { errorMessage: savedCartResponse.errorMessage};
  }
    const convertedClassResponse: IConvertedClassResponse = {
      convertedClassNumber: savedCartResponse?.convertedClassNumber ?? undefined,
      isSuccess: savedCartResponse?.isSuccess || false,
    };

    return convertedClassResponse;
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return getSavedCartFailureModel();
  }
}

export function handleCreateSavedCartFailure(message?: string): IConvertedClassResponse {
  logServer.error(AREA.SAVED_CART, message ? message : "Failed to create saved cart");
  return getSavedCartFailureModel();
}

export function getSavedCartFailureModel(): IConvertedClassResponse {
  const convertedClassResponseModel: IConvertedClassResponse = {
    isSuccess: false,
  };
  return convertedClassResponseModel;
}
