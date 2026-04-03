import { sendError, sendSuccess } from "@znode/utils/server";

import { getCartNumber } from "@znode/agents/cart";
import { getSavedUserSession } from "@znode/utils/common";

/**
 * Handles the GET request to retrieve the active cart number for the current user.
 *
 * This function fetches the current user's session and retrieves the active cart number using
 * `getCartNumber`. If the user ID is valid and the cart number is successfully retrieved,
 * a success response is sent. Otherwise, an error response is returned.
 *
 * @returns {Promise<Response>} - A response object indicating success or failure.
 *
 * Response Codes:
 * - 200: Cart number retrieved successfully.
 * - 403: Invalid User ID or cart number.
 * - 500: An error occurred while fetching the cart number.
 */
export async function GET() {
  try {
    const user = await getSavedUserSession();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      const cartNumber = await getCartNumber(userId);
      return sendSuccess(cartNumber, "Cart number retrieved successfully");
    } else {
      return sendSuccess("", "Cart number is not available for this user");
    }
  } catch (error) {
    return sendError("An error occurred while fetching Cart number: " + String(error), 500);
  }
}
