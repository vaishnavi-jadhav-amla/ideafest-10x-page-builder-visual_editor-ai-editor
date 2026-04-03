import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { ICompareProduct } from "@znode/types/product-details";
import { getCompareProductsDetails } from "@znode/agents/product";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const portalData = await getPortalHeader();
    const response = await getCompareProductsDetails(portalData, payload.productList as ICompareProduct[], payload.isProductList);
    return sendSuccess(response, "Compare product details retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the compare product details. " + String(error), 500);
  }
}
