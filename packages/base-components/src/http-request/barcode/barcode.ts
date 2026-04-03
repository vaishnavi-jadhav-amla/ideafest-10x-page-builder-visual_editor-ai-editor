import { objectToQueryString } from "@znode/utils/component";

export const getBarcodeProduct = async (searchTerm: { [key: string]: string | number }) => {
  const queryString: string = objectToQueryString(searchTerm);
  const searchProductList = await fetch(`/api/get-barcode-product-details?${queryString}`, { cache: "no-store" });
  const response = await searchProductList.json();
  return response;
};
