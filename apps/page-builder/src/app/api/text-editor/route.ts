import { getPortalHeader, sendSuccess } from "@znode/utils/server";

import { getContentPageText } from "@znode/agents/content-page";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const widgetKey = urlSearchParams.get("widgetKey") || "";
  const cmsMappingId = urlSearchParams.get("cmsMappingId") || "";
  const portalHeader = await getPortalHeader();
  

  const data = await getContentPageText({
    widgetCode: "", // No need widgetCode
    widgetKey: widgetKey, // "6787889",
    typeOfMapping: "ContentPageMapping",
    cmsMappingId: Number(cmsMappingId), // 206
    portalId: portalHeader.portalId,
    localeId: portalHeader.localeId,
  });

  return sendSuccess(data);
}
