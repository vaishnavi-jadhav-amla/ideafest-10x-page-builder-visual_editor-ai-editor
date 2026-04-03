import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getContentContainer } from "@znode/agents/content-container";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widgetKey = searchParams.get("widgetKey") || ""; // homepagePromo - 1788, AdSpace - 1787, Ticker - 1786
    const typeOfMapping = searchParams.get("typeOfMapping") || "";
    const cmsMappingID = searchParams.get("cmsMappingID") || "";

    const portalHeader = await getPortalHeader();
    const portalId = portalHeader?.portalId;
    const localeId = portalHeader?.localeId;

    const data = await getContentContainer({
      widgetCode: "",
      widgetKey: widgetKey,
      localeId: localeId,
      portalId: portalId,
      typeOfMapping,
      cmsMappingId: (cmsMappingID && cmsMappingID !== "") ? Number(cmsMappingID) : portalHeader.portalId
    });
    return sendSuccess(data);
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
