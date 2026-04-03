import { getDesiredSetting } from "@znode/agents/global-setting";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const globalSettingKey = searchParams.get("key") ?? "";

    if (!globalSettingKey) {
      return sendError("Missing required parameter: key", 400);
    }

    const settingsValue = await getDesiredSetting(globalSettingKey);

    if (settingsValue === null || settingsValue === undefined) {
      return sendError(`Setting not found for key: ${globalSettingKey}`, 404);
    }

    // Check if the setting is "True" or "False"
    if (settingsValue === "True") {
      return sendSuccess(settingsValue, "Request successful, The setting is enabled.");
    } else if (settingsValue === "False") {
      return sendSuccess(settingsValue, "Request successful, The setting is disabled.");
    } else {
      return sendError("Request failed, Unexpected setting value.", 400);
    }
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return sendError("Failed to retrieve the global setting due to a server error. Please try again later.", 500);
  }
}
