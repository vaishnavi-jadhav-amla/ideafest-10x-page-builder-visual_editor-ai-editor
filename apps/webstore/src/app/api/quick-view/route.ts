import { sendError, sendSuccess } from "@znode/utils/server";

import { IQuery } from "@znode/types/product";
import { getProductInformation } from "@znode/agents/product";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const productId = Number(requestBody.productId);
    if (productId) {
      const productDetails = await getProductInformation(productId, requestBody.queryParams || {} as IQuery);
      return sendSuccess(productDetails, "Product details retrieved successfully.");
    } else {
      return sendError(`Invalid Product ID - ${productId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching the product details " + String(error), 500);
  }
}
