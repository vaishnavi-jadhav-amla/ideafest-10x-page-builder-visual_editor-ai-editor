import { ISearchParams } from "@znode/types/search-params";
import { getProductList } from "@znode/agents/product";
import { sendSuccess } from "@znode/utils/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const categoryId = urlSearchParams.get("id");

  const searchParams: ISearchParams = {};

  const productData = await getProductList(Number(categoryId), searchParams);

  return sendSuccess(productData);
}
