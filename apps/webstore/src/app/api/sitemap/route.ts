import { getSiteMapByFeedType, getSiteMapByFileName } from "@znode/agents/sitemap";

import { NextRequest } from "next/server";
import { getPortalDetails } from "@znode/agents/portal";
import { sendError } from "@znode/utils/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    
    const portalData = await getPortalDetails();
    const storeCode = portalData.storeCode;
        // replacing first segment of url i.e locale
        const fileName = request.nextUrl.pathname.replace(/^\/([^/]+)\//, "").replace(/^\/+/, "");

    if (!fileName || !storeCode) {
      throw new Error("The parameter 'filename' OR 'storeCode' must be defined");
    }
    let sitemapXML;
    const xmlFiles=["sitemap.xml","googleproductfeed.xml","bingproductfeed.xml","xmlproductfeed.xml"];
    if (xmlFiles.includes(fileName) ) {
      sitemapXML = await getSiteMapByFeedType(storeCode || "", fileName);
    } else {
      sitemapXML = await getSiteMapByFileName(fileName, storeCode);
    }
    return new Response(sitemapXML, {
      status: 200,
      headers: { "Content-Type": "text/xml" }
    });
  } catch {
    return sendError("Unable to fetch sitemap.", 500);
  }
}