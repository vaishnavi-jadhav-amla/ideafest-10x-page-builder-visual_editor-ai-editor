import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { submitContactUs } from "@znode/agents/customer-feedback";

export async function POST(request: Request) {
  try {
    const requestModel = await request.json();
    const portalHeader = await getPortalHeader();
    const { storeCode } = portalHeader;
    const response = await submitContactUs(requestModel, storeCode || "");
    const hasError = response.hasError;
    const errorMessage = response.errorMessage || "";
    return sendSuccess({ hasError, errorMessage });
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
