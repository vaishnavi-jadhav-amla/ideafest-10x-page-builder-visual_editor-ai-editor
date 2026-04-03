import { getProductionContentPageByPageCode } from "@znode/agents/visual-editor";
import { sendSuccess } from "@znode/utils/server";

export async function GET(req: Request) { 
  const { searchParams } = new URL(req.url);
  const portalCode = searchParams.get("portalcode") || "";
  const contentPageCode = searchParams.get("contentPageCode") || "";
  const profileCode = "All";

  const pageData = await getProductionContentPageByPageCode(contentPageCode, portalCode, profileCode);

  return sendSuccess(pageData);
}
