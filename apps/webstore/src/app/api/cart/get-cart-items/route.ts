import { sendError, sendSuccess } from "@znode/utils/server";

import { getCartItems } from "@znode/agents/cart";

/**
 * Handles the HTTP GET request to fetch cart items for a specific user and portal.
 *
 * This function retrieves the cart items based on the `CartNumber`, portal, and user session information.
 * It first validates the portal and user session, then calls the `getCartItems` function to retrieve the cart data.
 *
 * @param {Request} request - The incoming HTTP request, expected to contain `CartNumber` as a query parameter.
 *
 * @returns {Promise<Response>} A success response with the cart items data if the request is successful,
 * or an error response if an error occurs during processing or if the portal/user session is invalid.
 *
 * @throws {Error} - Returns a 403 error if the portal ID or user ID is invalid, or a 500 error if a server-side error occurs.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const cartNumber = searchParams.get("cartNumber") || "";
    
    const response = await getCartItems(cartNumber);
    return sendSuccess(response, "Cart items retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the cart items." + String(error), 500);
  }
}
