import { getPortalHeader, getWidgetParams, sendSuccess } from "@znode/utils/server";

import { getLinkData } from "@znode/agents/widget";

export async function GET(req: Request) {
  const { typeOfMapping, widgetKey } = getWidgetParams(req);

  
  const portalHeader = await getPortalHeader();
  const linkWidgetData = await getLinkData({
    widgetKey,
    typeOfMapping,
    cmsMappingId: 7,
    widgetCode: "",
    portalId: portalHeader.portalId,
    localeId: portalHeader.localeId,
  });

  return sendSuccess(linkWidgetData);
}
