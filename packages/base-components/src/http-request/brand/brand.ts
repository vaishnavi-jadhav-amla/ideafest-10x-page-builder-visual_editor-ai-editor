import { ISearchParams } from "@znode/types/search-params";
import { IWidget } from "@znode/types/widget";

export async function getBrandProductsData(brandDetails: Omit<IWidget, "portalId" | "localeId">, brandSearchParam: ISearchParams) {
  const encodedBrandDetail = encodeURIComponent(JSON.stringify(brandDetails));

  const encodedBrandSearchParam = encodeURIComponent(JSON.stringify(brandSearchParam));

  const queryString = `brandDetail=${encodedBrandDetail}&brandSearchParam=${encodedBrandSearchParam}`;

  const res = await fetch(`/api/brand-products?${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const response = await res.json();
  return response;
}
