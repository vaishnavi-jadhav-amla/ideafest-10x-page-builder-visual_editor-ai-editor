import { getStoreCSS } from "@znode/agents/website-details";
import { getPortalHeader } from "@znode/utils/server";

export async function GET() {
  try {
    const portalData = await getPortalHeader();

    const themeCss = await getStoreCSS(portalData.storeCode || "");
    return new Response(`${themeCss}`, {
      status: 200,
      headers: { "Content-Type": "text/css" },
    });
  } catch (error) {
    return new Response("Internal server error.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
