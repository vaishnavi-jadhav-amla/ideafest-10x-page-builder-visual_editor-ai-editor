import { sendError, sendSuccess } from "@znode/utils/server";

import { updateFormConfiguration } from "@znode/agents/form-builder/update-form-configuration";
import { IUpdateFormConfigurationResponse } from "@znode/types/form-builder/save-form-configuration";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    const data: IUpdateFormConfigurationResponse | string = await updateFormConfiguration(payload);

    if (typeof data === "string") {
      return sendSuccess({
        errorMessage: data,
      });
    }

    if (data !== null && "isUpdated" in data && data.isUpdated) {
      return sendSuccess(data);
    }

    return sendError("Unexpected response structure.", 500);
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
