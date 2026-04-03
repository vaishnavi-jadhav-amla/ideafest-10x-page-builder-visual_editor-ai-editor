import { getPortalHeader, getWidgetParams, sendSuccess } from "@znode/utils/server";

import { IBannerSlider } from "@znode/types/slider-banner";
import { getSliderData } from "@znode/agents/widget";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { typeOfMapping, widgetKey, cmsMappingID } = getWidgetParams(req);
 const portalHeader = await getPortalHeader();
  const sliderBanners: IBannerSlider | null = await getSliderData({
    widgetKey,
    widgetCode: "",
    typeOfMapping,
    portalId: (cmsMappingID && cmsMappingID !== "") ? Number(cmsMappingID) : portalHeader.portalId,
    localeId: portalHeader.localeId,
    localeCode: portalHeader.localeCode,
    storeCode: portalHeader.storeCode,
  });

  return sendSuccess(sliderBanners);
}
