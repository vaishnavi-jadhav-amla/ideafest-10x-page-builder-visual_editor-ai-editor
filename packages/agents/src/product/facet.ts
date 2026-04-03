import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CategoryContents_productsByCategoryCode, FilterTuple, SearchFacetResponse2, SearchFacetValueResponse2 } from "@znode/clients/v2";
import { ExpandCollection, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, generateTagName } from "@znode/utils/server";
import { IProductListRequest, IProductPortalData } from "@znode/types/product";
import { createProductListRequest, getSortByProductList } from "./product";
import { getCategory, getCategoryExpands, getCategoryFilters, getContentCategoryFilters } from "../category";

import { ICategoryResponse } from "@znode/types/category";
import { IFacets } from "@znode/types/facet";
import { IFilterTuple } from "@znode/types/filter";
import { ISearchParams } from "@znode/types/search-params";
import { IUser } from "@znode/types/user";
import { getPortalDetails } from "../portal";
import { getSavedUserSession } from "@znode/utils/common";
import { getUserCatalogId } from "../user";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export async function getFacetList(categoryId: number, searchParams: ISearchParams) {
  try {
    const portalData = await getPortalDetails();
    const expand: ExpandCollection = await getCategoryExpands();
    const userData: IUser | null = await getSavedUserSession();
    const { publishCatalogId, portalFeatureValues, profileId, portalProfileCatalogId } = portalData || {};
    const userCatalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData || {});
    const filters: IFilterTuple[] = await getCategoryFilters(portalData.portalId, portalData.localeId || 0, userCatalogId || 0);

    const categoryData: ICategoryResponse = await getCategory(categoryId, filters, portalData.portalId);
    if (categoryData.catalogId && categoryData.categoryCode) {
      // TODO : createProductListRequest
      const productListRequest = await createProductListRequest(categoryData.catalogId, searchParams, portalData);
      productListRequest.CategoryId = categoryId;
      productListRequest.Category = categoryData?.categoryCode;
      const contentFilters: IFilterTuple[] = getContentCategoryFilters(portalData);

      const facetList: IFacets[] = await fetchAllFacets(expand, contentFilters, productListRequest, searchParams.sort, portalData);
      return facetList;
    }
    return createFacetList();
  } catch (error) {
    logServer.error(AREA.CATEGORY, `The error occurred in the getFacetList() method with parameters categoryId:${categoryId}, searchTerm:${searchParams?.searchTerm} in facet.ts file. ${errorStack(error)}`);
    return createFacetList();
  }
}
export const filterFacetAttributeValues = (attributeData: SearchFacetValueResponse2 []) => {
const facetData =  convertCamelCase(attributeData);
const filteredArray = facetData.map((item: SearchFacetValueResponse2) => {
  return Object.fromEntries(
    Object.entries(item).filter(([value]) => value !== null)
  );
});
return filteredArray;
};

export const prepareFacetList = (facetList: SearchFacetResponse2[]): IFacets[] => {
  const filteredFacetList = facetList.map((facet: SearchFacetResponse2) => ({
    attributeName: facet.AttributeName || "",
    attributeCode: facet.AttributeCode || "",
    attributeValues: facet.AttributeValues ? filterFacetAttributeValues(facet.AttributeValues) : [],
  }));
  return filteredFacetList as IFacets[];
};

export async function fetchAllFacets(
  expand: ExpandCollection,
  filters: IFilterTuple[],
  productListModel: IProductListRequest,
  sort?: string | null,
  portalData?: IProductPortalData
) {
  const refineBy = JSON.stringify(productListModel.RefineBy);
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL},${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.DYNAMIC_TAG}`, portalData?.storeCode || "", portalData?.catalogCode || "", "FacetProductsByCategoryCode"));

  const categoryProducts = await CategoryContents_productsByCategoryCode(
    productListModel?.Category as string,
    portalData?.catalogCode as string,
    portalData?.localeCode as string,
    portalData?.storeCode as string,
    undefined,
    refineBy,
    expand,
    filters as FilterTuple[],
    (await getSortByProductList(Number(sort))) || null,
    productListModel.PageIndex || 1,
    productListModel.PageSize || 1,
    cacheInvalidator.filterTupleArray as FilterTuple[]
  );

  const facetList = createFacetList(categoryProducts?.Facets);
  return facetList as IFacets[];
}

export const createFacetList = (facetList?: SearchFacetResponse2[]) => {
  if (!facetList || facetList.length === 0) {
    return [] as IFacets[];
  }
  const filteredFaucetList: IFacets[] = prepareFacetList(facetList || []);
  return filteredFaucetList as IFacets[];
};
