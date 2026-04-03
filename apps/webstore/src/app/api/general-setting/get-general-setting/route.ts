import { getGeneralSettingList } from "@znode/agents/general-setting";
import { sendError, sendSuccess } from "@znode/utils/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const generalSettingsList = await getGeneralSettingList();
    return sendSuccess({ generalSettingsList }, "General setting details retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the general setting details" + String(error), 500);
  }
}
