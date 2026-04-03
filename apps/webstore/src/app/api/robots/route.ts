import { getRobotsTxt } from "@znode/agents/portal/portal";
import { getPortalHeader } from "@znode/utils/server";

export async function GET() {
  try {
    const portalData = await getPortalHeader();
    const robotsText = await getRobotsTxt(portalData.storeCode || "");
    return new Response(robotsText,{
      status: 200,
    });
  } catch {
    return new Response("Internal server error.", {
      status: 500,
    });
  }
}
