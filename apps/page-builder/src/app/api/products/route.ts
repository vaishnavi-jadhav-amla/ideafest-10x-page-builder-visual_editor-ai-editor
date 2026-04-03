import { getPortalHeader, getWidgetParams, sendSuccess } from "@znode/utils/server";

import { getProductWidgetList } from "@znode/agents/product";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { typeOfMapping, widgetKey,  cmsMappingID} = getWidgetParams(req);
  const portalHeader = await getPortalHeader();

  const featureProductData = await getProductWidgetList({
    widgetKey: widgetKey,
    widgetCode: "",
    typeOfMapping: typeOfMapping,
    portalId: (cmsMappingID && cmsMappingID !== "") ? Number(cmsMappingID) : portalHeader.portalId,
    localeId: portalHeader.localeId,
  });
  return sendSuccess(featureProductData);
}
