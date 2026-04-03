import { sendError, sendSuccess } from "@znode/utils/server";

import { IQuery } from "@znode/types/product";
import { getConfigurableProduct } from "@znode/agents/configurable-product";
import { getPortalDetails } from "@znode/agents/portal";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const portalData = await getPortalDetails();
    const productDetails = await getConfigurableProduct(requestBody || ({} as IQuery), portalData);
    return sendSuccess(productDetails, "Product details retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the product details " + String(error), 500);
  }
}
