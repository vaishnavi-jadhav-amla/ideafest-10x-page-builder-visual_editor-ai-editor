import { IWidget } from "@znode/types/widget";
import { getContentPageData } from "@znode/agents/widget";
import { getPortalDetails } from "@znode/agents/portal/portal";

export async function GET(request: Request) {
  try {
    const portalData = await getPortalDetails();

    const { searchParams } = new URL(request.url);
    const requestBody: IWidget = {
      widgetKey: searchParams.get("widgetKey") ?? "",
      widgetCode: searchParams.get("widgetCode") ?? "",
      typeOfMapping: String(searchParams.get("typeOfMapping")),
      displayName: searchParams.get("displayName") ?? "",
      cmsMappingId: Number(searchParams.get("cMSMappingId")),
    };
    const contentPageData = (await getContentPageData(requestBody, portalData))?.text;
    return Response.json(contentPageData);
  } catch {
    return new Response("Internal server error.", {
      status: 500,
    });
  }
}
