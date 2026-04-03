import { getLinkData } from "@znode/agents/widget";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {localeId, portalId} = await getPortalHeader();
    const linkWidgetRequest = {
        localeId: localeId,
        widgetKey: payload.widgetKey,
        widgetCode: payload.widgetCode,
        typeOfMapping: payload.typeOfMapping,
        cmsMappingId: portalId,
        portalId: portalId,
    };
    const linkData = await getLinkData(linkWidgetRequest);
    return sendSuccess(linkData);
  } catch (error) {
    return sendError(
      "An error occurred while adding email. " + String(error),
      500
    );
  }
}
