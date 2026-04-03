import { getBreadCrumbs } from "@znode/agents/breadcrumb";
import { getPortalDetails } from "@znode/agents/portal/portal";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isParentCategory = searchParams.get("isParentCategory") === "true" ? true : false;
    const id = searchParams.get("id");
    
    const portalData = await getPortalDetails();
    const breadCrumbsResponse = await getBreadCrumbs(Number(id), isParentCategory, portalData);
    return Response.json(breadCrumbsResponse);
  } catch {
    return new Response("Internal server error.", {
      status: 500,
    });
  }
}
