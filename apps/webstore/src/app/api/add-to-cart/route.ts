import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { addToCartProduct } from "@znode/agents/cart";
import { getSavedUserSession } from "@znode/utils/common";

export async function POST(request: Request) {
  try {
    const portalData = await getPortalHeader();
    const addToCartRequest = await request.json();
    addToCartRequest.localeId = portalData.localeId;
    const userData = await getSavedUserSession();
    const userId: number = userData?.userId || 0;
    addToCartRequest.userId = userId;
    const addToCartResponse = await addToCartProduct(addToCartRequest, userData);
    return sendSuccess(addToCartResponse);
  } catch (error) {
    return sendError("Failed to Add to Cart Product." + String(error), 500);
  }
}
