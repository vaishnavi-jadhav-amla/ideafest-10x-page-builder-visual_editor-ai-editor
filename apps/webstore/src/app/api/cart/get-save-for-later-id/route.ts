import { sendError, sendSuccess } from "@znode/utils/server";

import { getSaveForLaterId } from "@znode/agents/cart";
import { getSavedUserSession } from "@znode/utils/common";

/**
 * Handles the GET request to retrieve the Save For Later ID for the current user.
 *
 * This function fetches the user's session, retrieves their user ID, and attempts to get their active
 * Save For Later class number. If successful, it returns the Save For Later ID; otherwise, it handles errors appropriately.
 *
 * @returns {Promise<Response>} - A response object indicating success or failure.
 *
 * - 200: Save For Later ID retrieved successfully.
 * - 403: Invalid user ID in session.
 * - 500: Error occurred while fetching the Save For Later ID.
 */
export async function GET() {
  try {
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      const saveForLaterData = await getSaveForLaterId(userId);
      return sendSuccess(saveForLaterData, "Save for later id retrieved successfully");
    } else {
      return sendError(`Invalid User ID - ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching save for later id: " + String(error), 500);
  }
}
