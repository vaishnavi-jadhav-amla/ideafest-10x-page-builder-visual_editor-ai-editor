import { getPreviewPageByPageCode } from "@znode/agents/visual-editor";
import { sendSuccess } from "@znode/utils/server";

export async function GET(req: Request) { 
  const { searchParams } = new URL(req.url);
  const portalCode = searchParams.get("portalCode") || "";
  const pageCode = searchParams.get("pageCode") || "";
  const profileCode = "All";

  const pageData = await getPreviewPageByPageCode(pageCode, portalCode, profileCode);

  return sendSuccess(pageData);
}
