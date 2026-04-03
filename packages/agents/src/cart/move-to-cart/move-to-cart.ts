import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { CommerceCollections_convert } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { IConvertedClassResponse } from "@znode/types/cart";
import { getSaveForLaterFailureModel, handleCreateSaveForLaterFailure } from "../save-for-later/create-save-for-later";

/**
 * Moves an item from the "Save for Later" section back to the cart.
 *
 * @param {string} saveForLaterNumber - The identifier for the saved item to be moved.
 * @param {string} targetClassType - The type of the target class (e.g., cart).
 * @param {string} cartItemId - The identifier of the cart item to move.
 *
 * @returns {Promise<ICreateCartResponse>} A promise that resolves to an object containing the updated cart number,
 * or an object with `cartNumber` as `undefined` in case of an error.
 */
export async function moveToCartFromSaveForLater(saveForLaterNumber: string, targetClassType: string, cartItemId: string): Promise<IConvertedClassResponse> {
  try {
    if (!(saveForLaterNumber || cartItemId || targetClassType)) {
      return handleCreateSaveForLaterFailure("Failed to move save for later item to cart.");
    }

    const saveForLaterRequestModel = convertPascalCase({
      targetClassNumber: "",
      targetClassName: "",
      itemId: cartItemId,
      additionalInstructions: {
        name: "",
        information: "",
      },
    });

    const response = await CommerceCollections_convert(ORDER_DATA_TYPE.MOVE_TO_CART, saveForLaterNumber, targetClassType, saveForLaterRequestModel);
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
