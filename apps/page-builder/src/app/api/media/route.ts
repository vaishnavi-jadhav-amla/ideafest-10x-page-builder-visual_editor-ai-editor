import { getPortalHeader, sendSuccess } from "@znode/utils/server";

import { getMediaWidget } from "@znode/agents/media";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const widgetKey = urlSearchParams.get("widgetKey") || "";
  const cmsMappingId = urlSearchParams.get("cmsMappingId") || "";
  const portalHeader = await getPortalHeader();
  // *** Reference for Image and Video media
  // image media -> widgetKey = "6787889";  cmsMappingId = 206
  // video media -> widgetKey = "8786787";  cmsMappingId = 233

  

  const data = await getMediaWidget({
    widgetCode: "", // No need widgetCode
    widgetKey: widgetKey, // "6787889",
    typeOfMapping: "ContentPageMapping",
    cmsMappingId: Number(cmsMappingId), // 206
    portalId: portalHeader.portalId,
    localeId: portalHeader.localeId,
  });

  return sendSuccess(data);
}
