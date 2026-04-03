import { sendError, sendSuccess } from "@znode/utils/server";

import { getCartPageSettings } from "@znode/agents/cart";

/**
 * Handles the HTTP GET request to fetch category page settings based on the current portal.
 *
 * This function first retrieves the portal header information, checks if a valid portal ID exists,
 * and then fetches the category page settings using the portal ID, locale ID, and publish state.
 *
 * @returns {Promise<Response>} A success response with the category page settings data if the request is successful,
 * or an error response if an error occurs during the process or if the portal ID is invalid.
 *
 * @throws {Error} - Returns a 403 error if the portal ID is invalid, or a 500 error if any other server-side error occurs.
 */
export async function GET(): Promise<Response> {
  try {
    const response = await getCartPageSettings();
    return sendSuccess(response);
  } catch (error) {
    return sendError("An error occurred while fetching the Order type data. " + String(error), 500);
  }
}
