import { getAddressListData } from "@znode/agents/address";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const dataResponse = await request.json();

    if (!dataResponse || typeof dataResponse !== "object") {
      return sendError("Invalid request data", 403);
    }

    const { userId, isAddressBook } = dataResponse;
    const address = await getAddressListData(userId, isAddressBook);
    return sendSuccess(address, "Address list fetching successfully");
  } catch (error) {
    return sendError("An error occurred while fetching address list " + String(error), 500);
  }
}
