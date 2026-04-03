import { getBrandDetails } from "@znode/agents/brand";
import { sendSuccess } from "@znode/utils/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const brandCode: string = urlSearchParams.get("id") || "";
  const brands = await getBrandDetails(brandCode);
  return sendSuccess(brands);
}
