import { sendError, sendSuccess } from "@znode/utils/server";

import { getSaveForLaterItems } from "@znode/agents/cart";
import { getSavedUserSession } from "@znode/utils/common";

/**
 * Handles the HTTP GET request to fetch saved items for later for a specific user and cart.
 *
 * This function retrieves the saved items based on the `cartNumber`, portal information, and user session.
 *
 * @param {Request} request - The incoming HTTP request containing `cartNumber` as a query parameter.
 *
 * @returns {Promise<Response>} A success response with the saved items data if the request is successful,
 * or an error response if the portal ID, cart number, or user ID is invalid.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const cartNumber = searchParams.get("cartNumber") || "";
  
  const { userId } = (await getSavedUserSession()) || {};

  if (cartNumber.trim() === "") {
    return sendError(`Invalid Cart Number ${cartNumber}.`, 403);
  }

  if (userId) {
    const response = await getSaveForLaterItems(cartNumber);
    return sendSuccess(response);
  } else {
    return sendError(`Invalid User ID ${userId}.`, 403);
  }
}
