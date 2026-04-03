import { sendError, sendSuccess } from "@znode/utils/server";

import { getStateList } from "@znode/agents/common";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    const stateList = await getStateList(countryCode as string);
    return sendSuccess(stateList, "State list retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the list of state. " + String(error), 500);
  }
}
