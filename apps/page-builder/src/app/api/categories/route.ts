import { getPortalHeader, getWidgetParams, sendSuccess } from "@znode/utils/server";

import { categories } from "@znode/agents/widget";

export async function GET(req: Request) {
  const { typeOfMapping, widgetKey, cmsMappingID } = getWidgetParams(req);
  const {localeId, portalId, localeCode, storeCode} = await getPortalHeader();
  const categoryList = await categories({
    widgetKey: widgetKey,
    widgetCode: "",
    typeOfMapping: typeOfMapping,
    portalId: (cmsMappingID && cmsMappingID !== "") ? Number(cmsMappingID) : portalId,
    localeId: localeId,
    localeCode: localeCode,
    storeCode: storeCode
  });

  return sendSuccess(categoryList);
}
