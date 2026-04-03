import { sendError, sendSuccess } from "@znode/utils/server";
import { deleteOrderTemplate } from "@znode/agents/account/order-template/delete";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classNumber = searchParams.get("classNumber") as string;
    const deleteOrderTemplateResponse = await deleteOrderTemplate(classNumber);
    return sendSuccess(deleteOrderTemplateResponse, "Order template deleted successfully");
  } catch (error) {
    return sendError("Failed to Delete Order Template." + String(error), 500);
  }
}
