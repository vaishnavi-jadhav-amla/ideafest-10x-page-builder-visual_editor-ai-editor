import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../base";
import { ISearchProductResponse } from "@znode/types/quick-order";
import { IQuickOrder, ISelectedProduct } from "@znode/types/quick-order";

export const getProductsDataBySku = async (props: { [key: string]: string }) => {
  const queryString: string = objectToQueryString(props);
  const searchProductData = await httpRequest<ISelectedProduct>({ endpoint: `/api/quick-order/product-search?${queryString}`, method: "GET" });

  return searchProductData;
};

export async function getSuggestions(searchProps: { searchTerm: string }) {
  const queryString: string = objectToQueryString(searchProps);
  const response = await httpRequest<ISearchProductResponse>({ endpoint: `/api/search/search-suggestions?${queryString}`, method: "GET" });
  if (response.hasError) return [];
  return response.products;
}

export async function downloadTemplate(filePath: string) {
  const response = await fetch(`/api/quick-order/download-template?path=${encodeURIComponent(filePath)}`);

  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addProductsToQuickOrderUsingExcel(props: any) {
  const response = await httpRequest<IQuickOrder>({ endpoint: "/api/quick-order/upload-excel", method: "POST", body: props });
  return response;
}
