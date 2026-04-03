import { convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { CART_COOKIE } from "@znode/constants/cookie";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CommerceCollections_convert } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

/**
 * create quote.
 *
 * @param {string} cartNumber - The current cart's number.
 * @param {string} targetClassType - The type of target class (e.g., saved for later).
 * @param {string} itemId - The ID of the item to be moved to save for later.
 * @throws Will log an error if the cart conversion or data transformation fails, and return a response with an undefined cartNumber.
 */
export async function convertToQuote(cartNumber: string, targetClassType: string, jobName: string, additionalInstruction: string) {
  try {
    const createQuoteRequestModel = convertPascalCase({
      targetClassNumber: "",
      targetClassName: targetClassType,
      itemId: CART_COOKIE.DEFAULT_CART_ID,
      additionalInstructions: {
        name: jobName,
        information: additionalInstruction,
      },
    });

    const quoteDetails = await CommerceCollections_convert(ORDER_DATA_TYPE.QUOTE, cartNumber, targetClassType, createQuoteRequestModel);
    const formattedData = convertCamelCase(quoteDetails);

    return {
      quoteNumber: formattedData?.convertedClassNumber,
      isSuccess: formattedData?.isSuccess,
    };
  } catch (error) {
    logServer.error(AREA.QUOTE, errorStack(error));

    return {
      quoteNumber: null,
    };
  }
}
