import { createOrderTemplate } from "@znode/agents/account/order-template";
import { getSavedUserSession } from "@znode/utils/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataRequest = await request.json();
    const userData = await getSavedUserSession();
    const createTemplateResponse = await createOrderTemplate(dataRequest, userData);
    return sendSuccess(createTemplateResponse, "Order template created successfully");
  } catch (error) {
    return sendError("An error occurred while creating order template." + String(error), 500);
  }
}
