import { getPortalData } from "@znode/agents/address";
import { getCatalogCode } from "@znode/agents/category";
import { addProductsToQuickOrderUsingExcel } from "@znode/agents/quick-order/quick-order-excel";
import { sendSuccess, sendError } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const portalData = await getPortalData();
    const catalogCode = await getCatalogCode(portalData);
    const quickOrderExcelData = await addProductsToQuickOrderUsingExcel(requestBody?.parsedData, portalData.storeCode || "", portalData.localeCode || "", catalogCode || "");
    return sendSuccess(quickOrderExcelData, "Request successful");
  } catch (error) {
    return sendError("An error occurred while adding to cart" + String(error), 500);
  }
}
