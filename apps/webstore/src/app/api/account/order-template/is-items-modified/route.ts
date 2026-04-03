import { isOrderTemplateItemsModified } from "@znode/agents/account/order-template";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataRequest = await request.json();
    const isOrderTemplateItemsModifiedResponse = await isOrderTemplateItemsModified(dataRequest.templateLineItems, dataRequest.classNumber);
    return sendSuccess(isOrderTemplateItemsModifiedResponse, "Order template modified.");
  } catch (error) {
    return sendError("An error occurred." + String(error), 500);
  }
}
