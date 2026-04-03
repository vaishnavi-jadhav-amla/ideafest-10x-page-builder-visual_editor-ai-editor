import { IQuery } from "@znode/types/product";
import { IRecentlyViewedSkuProductList } from "@znode/types/product-details";
import { httpRequest } from "../base";

export const getRecentlyViewProducts = async (body: IRecentlyViewedSkuProductList[]) => {
  const response = await httpRequest({ endpoint: "/api/recently-view-product", method: "POST", body: body });
  return response;
};
export const getLinkProductList = async (sku: string, productId: number) => {
  const response = await httpRequest({ endpoint: "/api/link-products", method: "PUT", body: { sku, productId } });
  return response;
};

export const getConfigProductDataForQuickView = async (body: IQuery) => {
  const response = await httpRequest({ endpoint: "/api/configurable-product-quick-view", method: "POST", body: body });
  return response;
};
