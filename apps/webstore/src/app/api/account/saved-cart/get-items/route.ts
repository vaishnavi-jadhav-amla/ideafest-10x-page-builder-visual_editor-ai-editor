import { getSavedCartItems } from "@znode/agents/account";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classNumber = searchParams.get("classNumber") as string;
    const savedCartItems = await getSavedCartItems(classNumber);
    return sendSuccess(savedCartItems, "Saved cart items retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching order template items." + String(error), 500);
  }
}
