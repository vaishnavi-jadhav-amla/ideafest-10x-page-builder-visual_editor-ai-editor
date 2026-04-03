import { getBrandList } from "@znode/agents/brand";
import { sendSuccess } from "@znode/utils/server";

export async function GET() {

  const brands = await getBrandList();
  return sendSuccess(brands);
}
