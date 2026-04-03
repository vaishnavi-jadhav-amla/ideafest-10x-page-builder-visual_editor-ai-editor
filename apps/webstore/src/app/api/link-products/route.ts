import { sendError, sendSuccess } from "@znode/utils/server";

import { getLinkProductList } from "@znode/agents/product";

export async function PUT(request: Request) {
  try {
    const payload: { sku: string , productId: number} = await request.json();
    const productList = await getLinkProductList(payload.sku, payload.productId);
    return sendSuccess(productList, "Product linked successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the product list" + String(error), 500);
  }
}
