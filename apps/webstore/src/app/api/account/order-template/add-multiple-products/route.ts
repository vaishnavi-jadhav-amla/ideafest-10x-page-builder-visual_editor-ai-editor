import { addMultipleProductsToOrderTemplate } from "@znode/agents/account/order-template";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataResponse = await request.json();
    const templateItems = await addMultipleProductsToOrderTemplate(dataResponse);
    return sendSuccess(templateItems, "Products added successfully to order template");
  } catch (error) {
    return sendError("Failed to add products to template." + String(error), 500);
  }
}
