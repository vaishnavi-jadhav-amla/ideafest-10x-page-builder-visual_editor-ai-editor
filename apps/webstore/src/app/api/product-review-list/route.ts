import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { ICustomerReviewResponse } from "@znode/types/product";
import { getProductReviewListForPDP } from "@znode/agents/product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const pageNumber = searchParams.get("pageNumber");
    const pageSize = searchParams.get("pageSize");
    const sortBy = searchParams.get("sortBy");
    const portalHeader = await getPortalHeader();
    const productReviewList: ICustomerReviewResponse = await getProductReviewListForPDP(
      portalHeader.portalId,
      portalHeader.localeId,
      Number(productId),
      sortBy || "",
      Number(pageSize),
      Number(pageNumber)
    );
    return sendSuccess(productReviewList, "Product reviews retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching reviews. " + String(error), 500);
  }
}
