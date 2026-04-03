import { getBrandProductList } from "@znode/agents/product";
import { sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandDetail = searchParams.get("brandDetail");
  const brandSearchParam = searchParams.get("brandSearchParam");
  const brandDetails = JSON.parse(brandDetail || "");
  const brandSearchParams = JSON.parse(brandSearchParam || "");
  const brands = await getBrandProductList(brandDetails, brandSearchParams);
  return sendSuccess(brands);
}
