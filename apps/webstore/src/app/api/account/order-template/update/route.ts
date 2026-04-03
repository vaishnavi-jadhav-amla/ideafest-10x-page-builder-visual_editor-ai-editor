import { updateOrderTemplate } from "@znode/agents/account/order-template";
import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";

export async function POST(request: Request) {
  try {
    const { updateOrderTemplateModel } = await request.json();
    const userData = await getSavedUserSession();
    const createTemplateResponse = await updateOrderTemplate(updateOrderTemplateModel, userData);
    return sendSuccess(createTemplateResponse, "Order template created successfully");
  } catch (error) {
    return sendError("An error occurred while creating order template." + String(error), 500);
  }
}
