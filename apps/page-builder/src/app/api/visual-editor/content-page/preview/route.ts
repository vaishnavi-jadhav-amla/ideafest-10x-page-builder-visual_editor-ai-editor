import { getPreviewContentPageByPageCode } from "@znode/agents/visual-editor";
import { sendSuccess } from "@znode/utils/server";

export async function GET(req: Request) { 
  const { searchParams } = new URL(req.url);
  const portalCode = searchParams.get("portalCode") || "";
  const contentPageCode = searchParams.get("contentPageCode") || "";
  const profileCode = "All";

  const pageData = await getPreviewContentPageByPageCode(contentPageCode, portalCode, profileCode);

  return sendSuccess(pageData);
}
