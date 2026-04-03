import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getContentMessage } from "@znode/agents/common";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const portalData = await getPortalHeader();
    const inputKey = searchParams.get("inputKey");
    const contentBlockData: string = await getContentMessage(inputKey ?? "", portalData.portalId, portalData.localeId);
    return sendSuccess(contentBlockData, "Content block data retrieved successfully ");
  } catch (error) {
    return sendError(`An error occurred while fetching the content block data: ${String(error)}`, 500);
  }
}
