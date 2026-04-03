import { ISubcategoryResponse } from "@znode/types/category";
import { httpRequest } from "../base";

export const getWebStoreCategory = async (categoryCode: string, isAllCategory: boolean, signal?: AbortSignal) => {
  const subCategoryData = await httpRequest<ISubcategoryResponse>({ endpoint: "/api/category-navigation", signal, queryParams: { categoryCode, isAllCategory } });
  return subCategoryData;
};
