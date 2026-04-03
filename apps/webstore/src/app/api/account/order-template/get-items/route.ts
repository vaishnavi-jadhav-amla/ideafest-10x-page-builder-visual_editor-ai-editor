import { getOrderTemplateItems } from "@znode/agents/account/order-template/get-items";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classNumber = searchParams.get("classNumber") as string;
    const orderTemplateItems = await getOrderTemplateItems(classNumber);
    return sendSuccess(orderTemplateItems, "Order template items retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching order template items." + String(error), 500);
  }
}
