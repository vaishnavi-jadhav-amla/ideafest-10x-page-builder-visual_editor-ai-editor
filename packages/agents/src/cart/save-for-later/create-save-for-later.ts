import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { CommerceCollections_convert } from "@znode/clients/cp";
import { IConvertedClassResponse } from "@znode/types/cart";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

/**
 * Moves a cart item to a "Save For Later" list by converting the cart and saving the item to a target list.
 *
 * @param {string} cartNumber - The current cart's number.
 * @param {string} targetClassType - The type of target class (e.g., saved for later).
 * @param {string} cartItemId - The ID of the item to be moved to save for later.
 * @param {string} targetSavedForLaterNumber - The target list's number where the item will be saved for later.
 * @returns {Promise<ICreateCartResponse>} A promise that resolves with the updated cart information, including the new cart number.
 *
 * @throws Will log an error if the cart conversion or data transformation fails, and return a response with an undefined cartNumber.
 */
export async function createSaveForLater(cartNumber: string, targetClassType: string, cartItemId: string, targetSavedForLaterNumber: string): Promise<IConvertedClassResponse> {
  try {
    if (!(cartNumber || cartItemId || targetClassType)) {
      return handleCreateSaveForLaterFailure();
    }

    const saveForLaterRequestModel = convertPascalCase({
      targetClassNumber: targetSavedForLaterNumber,
      targetClassName: "",
      itemId: cartItemId,
      additionalInstructions: {
        name: "",
        information: "",
      },
    });

    const response = await CommerceCollections_convert(ORDER_DATA_TYPE.CREATE_SAVE_FOR_LATER, cartNumber, targetClassType, saveForLaterRequestModel);
    const saveForLaterResponse = convertCamelCase(response);

    const convertedClassResponse: IConvertedClassResponse = {
      convertedClassNumber: saveForLaterResponse?.convertedClassNumber ?? undefined,
      isSuccess: saveForLaterResponse?.isSuccess || false,
    };

    return convertedClassResponse;
  } catch (error) {
    logServer.error(AREA.SAVE_FOR_LATER, errorStack(error));
    return getSaveForLaterFailureModel();
  }
}

export function handleCreateSaveForLaterFailure(message?: string): IConvertedClassResponse {
  logServer.error(AREA.SAVE_FOR_LATER, message ? message : "Failed to move cart item to save for later");
  return getSaveForLaterFailureModel();
}

export function getSaveForLaterFailureModel(): IConvertedClassResponse {
  const convertedClassResponseModel: IConvertedClassResponse = {
    isSuccess: false,
  };
  return convertedClassResponseModel;
}
