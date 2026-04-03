import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getFormConfiguration } from "@znode/agents/form-builder";
import { IGetFormConfigurationRequest, IGetFormConfigurationResponse } from "@znode/types/form-builder/get-form-configuration";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const widgetKey = searchParams.get("widgetKey");

    const portalHeader = await getPortalHeader();
    const requestBody: IGetFormConfigurationRequest = {
      storeCode: portalHeader.storeCode,
      widgetKey: widgetKey || "",
    };
    const data: IGetFormConfigurationResponse | null = await getFormConfiguration(requestBody);

    if (data !== null && "cmsFormWidgetConfigurationId" in data && data?.cmsFormWidgetConfigurationId) {
      return sendSuccess(data, "form configuration retrieved successfully");
    }

    return sendError("Internal server error.", 500);
  } catch (error) {
    return sendError("Internal server error.", 500);
  }
}
