import { sendError, sendSuccess } from "@znode/utils/server";
import { deleteSavedCart } from "@znode/agents/account";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classNumber = searchParams.get("classNumber") as string;
    const deleteSavedResponse = await deleteSavedCart(classNumber);
    return sendSuccess(deleteSavedResponse, "Saved cart deleted successfully");
  } catch (error) {
    return sendError("Failed to delete saved cart." + String(error), 500);
  }
}
