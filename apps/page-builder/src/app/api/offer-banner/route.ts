import { getPortalHeader, getWidgetParams, sendSuccess } from "@znode/utils/server";

import { getOfferBannerData } from "@znode/agents/widget";

export async function GET(req: Request) {
  const { typeOfMapping, widgetKey, cmsMappingID } = getWidgetParams(req);
  const portalHeader = await getPortalHeader();
  

  const offerBannerData = await getOfferBannerData({
    widgetKey: widgetKey,
    widgetCode: "",
    typeOfMapping: typeOfMapping,
    portalId: (cmsMappingID && cmsMappingID !== "") ? Number(cmsMappingID) : portalHeader.portalId,
    localeId: portalHeader.localeId,
    localeCode: portalHeader.localeCode,
    storeCode: portalHeader.storeCode,
  });
  return sendSuccess(offerBannerData);
}
