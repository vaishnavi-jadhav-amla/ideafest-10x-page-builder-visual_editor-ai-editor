import { sendError, sendSuccess } from "@znode/utils/server";

import { saveForm } from "@znode/agents/form-builder/save-form";
import { ISaveFormResponse } from "@znode/types/form-builder/save-form";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const data: ISaveFormResponse | string = await saveForm(payload);

    if (typeof data === "string") {
      return sendSuccess({
        errorMessage: data,
      });
    }
    if (data !== null && "formBuilderId" in data && data.formBuilderId) {
      return sendSuccess(data);
    }

    return sendError("Unexpected response structure.", 500);
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
