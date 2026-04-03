import { ISearchParams } from "@znode/types/search-params";
import { getSearchResult } from "@znode/agents/search";
import { sendError } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("decodedText");
    let product;
    if (param) {
      const searchRequestParam: ISearchParams = {};
      searchRequestParam.searchTerm = param;
      let productData;
      if (searchRequestParam.searchTerm) {
        productData = await getSearchResult(searchRequestParam);
      }
      if (productData) {
        product = productData;
      } else {
        product = null;
      }
    } else {
      product = null;
    }
    return Response.json(product);
  } catch (error) {
    return sendError("No products found for the provided barcode. " + String(error), 500);
  }
}
