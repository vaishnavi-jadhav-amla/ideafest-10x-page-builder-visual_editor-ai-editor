import { CommerceCollections_className } from "@znode/clients/cp";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ISavedCart } from "@znode/types/account";
import { getSavedCart } from "./saved-cart-list";
import { convertCamelCase } from "@znode/utils/server";

/**
 * Edit Save Cart Name
 * @param classNumber - The saved cart number to match
 * @param className - The new name for the template
 * @param userId - The user ID for fetching saved cart templates
 * @returns boolean - Returns `true` if successful, `false` otherwise
 */
export async function editSaveCartName(classType: string, classNumber: string, className: string, userId: number): Promise<boolean> {
  try {
    let status = false;

    if (classNumber && className) {
      const templateList = await getSavedCart(userId);
      const match = templateList?.collectionDetails?.find((x: ISavedCart) => x.className?.toLowerCase() === className.toLowerCase());
      if (!match) {
        const response = await CommerceCollections_className(classType, classNumber, className);
        const formattedDetails = await convertCamelCase(response);
        status = formattedDetails || false;
      }
    }
    return status;
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return false;
  }
}
