import { IUpdateCategory } from "@znode/types/facet";
import { httpRequest } from "../base";

export const getCategoryList = async (searchTerm = "", categoryCodes = "") => {
  const categoryListResponse = await httpRequest<IUpdateCategory>({ endpoint: "/api/search-category", method: "GET", queryParams: { searchTerm, categoryCodes } });
  return categoryListResponse;
};
