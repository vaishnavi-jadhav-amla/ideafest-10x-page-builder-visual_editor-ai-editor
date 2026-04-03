import { sendError, sendSuccess } from "@znode/utils/server";

import { bindProductPricingData } from "@znode/agents/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skuList = searchParams.get("skuList");
    let priceList;
    if (skuList && skuList?.length > 0) {
      priceList = await bindProductPricingData(skuList);
    } else {
      return sendError("Sku list is empty", 404);
    }
    return sendSuccess(priceList, "price list retrieved successfully ");
  } catch (error) {
    return sendError("An error occurred while fetching the price list" + String(error), 500);
  }
}