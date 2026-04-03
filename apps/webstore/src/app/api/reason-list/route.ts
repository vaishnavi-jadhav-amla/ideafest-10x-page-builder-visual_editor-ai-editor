import { sendError, sendSuccess } from "@znode/utils/server";

import { getReasonList } from "@znode/agents/account";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reasonList = await getReasonList();
    return sendSuccess( reasonList,  "Retrieved reason list successfully" );
  } catch (error) {
    return sendError("An error occurred while fetching the reason list" + String(error), 500);
  }
}
