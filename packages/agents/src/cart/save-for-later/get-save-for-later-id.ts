import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CommerceCollections_activeClassNumberByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

/**
 * Retrieves the active Save For Later class number for a given user.
 *
 * @param {number} userId - The ID of the user whose Save For Later class number is being fetched.
 * @returns {Promise<string | null>} - The Save For Later class number, or null if not found or an error occurs.
 *
 * @throws {Error} - If an error occurs while fetching the Save For Later class number.
 */
export async function getSaveForLaterId(userId: number): Promise<string | null> {
  try {
    if (!userId) {
      logServer.error(AREA.SAVE_FOR_LATER, "Invalid user id");
      return null;
    }

    const saveForLaterData = await CommerceCollections_activeClassNumberByClassType(ORDER_DATA_TYPE.SAVE_FOR_LATER, userId);
    const saveForLaterId = saveForLaterData?.ClassNumber && typeof saveForLaterData.ClassNumber === "string" ? saveForLaterData.ClassNumber : null;

    return saveForLaterId;
  } catch (error) {
    logServer.error(AREA.SAVE_FOR_LATER, errorStack(error));
    return null;
  }
}
