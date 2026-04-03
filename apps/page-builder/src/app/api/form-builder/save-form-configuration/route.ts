import { sendError, sendSuccess } from "@znode/utils/server";

import { saveFormConfiguration } from "@znode/agents/form-builder";
import { ISaveFormConfigurationResponse } from "@znode/types/form-builder/save-form-configuration";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const data: ISaveFormConfigurationResponse | string = await saveFormConfiguration(payload);

    if (typeof data === "string") {
      return sendSuccess({
        errorMessage: data,
      });
    }
    if (data !== null && "cmsFormWidgetConfigurationId" in data && data?.cmsFormWidgetConfigurationId) {
      return sendSuccess(data);
    }

    return sendError("Unexpected response structure.", 500);
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
