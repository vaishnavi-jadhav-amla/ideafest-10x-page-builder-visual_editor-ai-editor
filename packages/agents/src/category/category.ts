import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CMSWidgets_categories, CMSWidgets_megaMenuCategories, PublishCategories_idByCategoryId, PublishCategories_publishedCategories } from "@znode/clients/v2";
import {
  ExpandCollection,
  ExpandKeys,
  FilterCollection,
  FilterKeys,
  FilterOperators,
  addCacheTagsIntoFilter,
  convertCamelCase,
  convertPascalCase,
  generateCacheKey,
  generateTagName,
  generateTagWithKey,
} from "@znode/utils/server";
import { FilterTuple, WebStoreCategoryListResponse } from "@znode/clients/v1";
import { ICategory, ICategoryDetails, ICategoryResponse, IMegaMenuCategory, ISubCategoryItemsData } from "@znode/types/category";
import { IProfile, IUser } from "@znode/types/user";
import { getSavedUserSession, stringToBooleanV2 } from "@znode/utils/common";
import { getUserCatalogId, getUserProfileId } from "../user";
import { mapCategoryData, mapCategoryList } from "./category-helper";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { COMMON } from "@znode/constants/common";
import { IBaseWidget } from "@znode/types/widget";
import { IFilterTuple } from "@znode/types/filter";
import { IPortalDetail } from "@znode/types/portal";
import { PRODUCT } from "@znode/constants/product";
import { SETTINGS } from "@znode/constants/settings";
import { getPortalDetails } from "../portal/portal";
import { mapCategories } from "./mapper";

export async function getCategory(categoryId: number, filters: IFilterTuple[], portalId: number) {
  try {
    const expand: ExpandCollection = await getCategoryExpands();
    const portalData = await getPortalDetails();
    const catalogId = parseInt(filters.filter((x) => x.filterName === PRODUCT.ZNODE_CATALOG_ID)?.at(0)?.filterValue || "");
    const cacheKey = generateCacheKey(CACHE_KEYS.GET_PUBLISH_CATEGORY, categoryId, catalogId, portalId);
    const cacheTag = generateTagWithKey(cacheKey, `${CACHE_KEYS.CATALOG},${CACHE_KEYS.PORTAL}`, catalogId, portalId);
    addCacheTagsIntoFilter(cacheTag, filters);
    const catalogCode = await getCatalogCode(portalData);
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.CATEGORY}, ${CACHE_KEYS.DYNAMIC_TAG}`, String(catalogCode), String(categoryId), "IdByCategoryId")
    );
    const categoryResponse = await PublishCategories_idByCategoryId(
      categoryId,
      catalogCode as string,
      portalData.storeCode as string,
      portalData.localeCode,
      expand,
      undefined,
      undefined,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    return {
      categoryName: categoryResponse?.Name || null,
      catalogId: categoryResponse?.ZnodeCatalogId || null,
      categoryCode: categoryResponse?.CategoryCode || null,
      attributes: convertCamelCase(categoryResponse?.Attributes) || [],
    };
  } catch (error) {
    logServer.error(AREA.CATEGORY, `The error occurred in the getCategory() method with requested parameters categoryId:${categoryId}, filters:${JSON.stringify(filters)}, portalId:${portalId} in category.ts file. ${errorStack(error)}`);
    return { categoryName: null, catalogId: null, categoryCode: null, attributes: [] } as ICategoryResponse;
  }
}

/**
 * Get expand keys for categories.
 * @returns the expand keys for categories.
 */
export async function getCategoryExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Promotions);
  expands.add(ExpandKeys.Pricing);
  expands.add(ExpandKeys.AssociatedProducts);
  expands.add(ExpandKeys.Seo);
  expands.add(ExpandKeys.Facet);
  expands.add(ExpandKeys.Highlights);
  return expands;
}

/**
 * Get category filters.
 * @param portalId
 * @param localeId
 * @param catalogId
 * @returns filters.
 */
export function getCategoryFilters(portalId: number, localeId: number, catalogId: number, isGetAllLocationsInventory?: string, isParentCategoryEnabled?: boolean) {
  const filters: FilterCollection = new FilterCollection();
  if (isParentCategoryEnabled) filters.add(FilterKeys.ZnodeParentCategoryIds, FilterOperators.Equals, isParentCategoryEnabled.toString());
  if (isGetAllLocationsInventory) filters.add(FilterKeys.IsGetAllLocationsInventory, FilterOperators.Equals, isGetAllLocationsInventory.toString());
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId?.toString());
  return filters.filterTupleArray;
}

export function getFullTextSearchFilter(portalId: number, displayAllWarehousesStock: string | undefined, isProductInheritanceEnabled: boolean) {
  const filters: FilterCollection = new FilterCollection();
  if (displayAllWarehousesStock) filters.add(FilterKeys.IsGetAllLocationsInventory, FilterOperators.Equals, displayAllWarehousesStock.toString());
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId?.toString());
  filters.add(FilterKeys.IsProductInheritanceEnabled, FilterOperators.Equals, isProductInheritanceEnabled?.toString());

  return filters.filterTupleArray;
}

export function getContentCategoryFilters(portalData: IPortalDetail, displayAllWarehousesStock? : string) {
  const { portalId, portalFeatureValues } = portalData;
  const { enableProductInheritance } = portalFeatureValues || {};
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId?.toString());
  if(displayAllWarehousesStock) filters.add(FilterKeys.IsGetAllLocationsInventory, FilterOperators.Equals, displayAllWarehousesStock.toString());
  if (enableProductInheritance === true) filters.add(FilterKeys.IsProductInheritanceEnabled, FilterOperators.Equals, enableProductInheritance?.toString());
  return filters.filterTupleArray;
}

export async function getStoreCatalogId(profileId?: number, publishCatalogId?: number, portalProfileCatalogId?: number) {
  if ((profileId || 0) >= 0 && (portalProfileCatalogId || 0) > 0) {
    return portalProfileCatalogId;
  }
  return publishCatalogId;
}

export async function fetchMegaMenuCategoryList(filters: IFilterTuple[]) {
  const sort: { [key: string]: string } = {};
  sort["DisplayOrder"] = "ASC";
  const portalData = await getPortalDetails();
  const catalogCode = await getCatalogCode(portalData);
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(
    FilterKeys.CacheTags,
    FilterOperators.Contains,
    generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CATALOG}`, portalData.storeCode || "", catalogCode || "")
  );
  const categoriesList: WebStoreCategoryListResponse = await CMSWidgets_megaMenuCategories(
    catalogCode,
    portalData.localeCode,
    portalData.storeCode,
    undefined,
    convertPascalCase(filters),
    sort,
    undefined,
    undefined,
    cacheInvalidator.filterTupleArray as FilterTuple[]
  );
  if (categoriesList?.Categories) {
    const categories = categoriesList.Categories;
    const mappedCategories = mapCategories(categories);
    return mappedCategories;
  } else {
    logServer.error(AREA.CATEGORY, `error for method fetchMegaMenuCategoryList with catalog code${catalogCode}, locale code ${portalData.localeCode} and portal code ${portalData.storeCode} and ${JSON.stringify(categoriesList)}`);
    if(!portalData?.storeCode)
    {
      logServer.error(AREA.CATEGORY, `store code not found in method fetchMegaMenuCategoryList ${portalData?.storeCode} with portal response ${JSON.stringify(portalData)} `);
    }
    return [];
  }
}

export async function getCategoryList(filters: IFilterTuple[]) {
  const sort: { [key: string]: string } = {};
  sort["DisplayOrder"] = "ASC";
  const portalData = await getPortalDetails();
  const catalogCode = await getCatalogCode(portalData);
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(
    FilterKeys.CacheTags,
    FilterOperators.Contains,
    generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CATALOG}`, portalData.storeCode || "", catalogCode || "")
  );
  const categoriesList: WebStoreCategoryListResponse = await CMSWidgets_categories(
    catalogCode,
    portalData.localeCode,
    portalData.storeCode,
    undefined,
    convertPascalCase(filters),
    sort,
    undefined,
    undefined,
    cacheInvalidator.filterTupleArray as FilterTuple[]
  );
  if (categoriesList?.Categories) {
    const categories = categoriesList.Categories;
    const mappedCategories = mapCategories(categories);
    return convertCamelCase(mappedCategories);
  } else {
    return [];
  }
}
function addBreadcrumbs(categories: IMegaMenuCategory[], parentBreadcrumb = []) {
  return categories.map((category) => {
    const breadcrumb = [...parentBreadcrumb, { name: category.name, url: category.categoryUrl }];

    const updatedCategory = {
      ...category,
      breadcrumbHtml: breadcrumb.map((item) => `<a href="${item.url}" aria-label ="${item.name}" >${item.name}</a>`).join(" / "),
    };

    if (category.hasSubCategories && category?.subCategories && category?.subCategories.length > 0) {
      updatedCategory.subCategories = addBreadcrumbs(category.subCategories as [], breadcrumb as []) as ISubCategoryItemsData[];
    }

    return updatedCategory;
  });
}

export async function getMegaMenuCategories(user: IUser | null, isAllCategory: boolean, categoryCode?: string): Promise<ICategoryDetails> {
  const userData = user ? user : await getSavedUserSession();
  const requiredProperties = [
    { key: "AttributeCode", value: "LoginRequired" },
    { key: "AttributeCode", value: "EnableQuoteRequest" },
  ];
  const portalData = await getPortalDetails(requiredProperties);
  const loginRequired = portalData?.loginRequired ? stringToBooleanV2(`${portalData.loginRequired}`) : false;
  const isEnableQuoteRequest = portalData?.enableQuoteRequest ? stringToBooleanV2(`${portalData.enableQuoteRequest}`) : false;
  if (loginRequired && !userData?.userId) return { categories: [], isUserLoggedIn: false ,isEnableQuoteRequest};

  try {
    const filters: IFilterTuple[] = await getMegaMenuCategoryFilters(isAllCategory, categoryCode);
    const categoriesResponse = await fetchMegaMenuCategoryList(filters);
    return { categories: categoriesResponse ?? [], isUserLoggedIn: userData && userData.userId && userData.userId > 0 ? true : false ,isEnableQuoteRequest};
  } catch (error) {
    logServer.error(AREA.CATEGORY, errorStack(error));
    return { categories: [], isUserLoggedIn: false , isEnableQuoteRequest};
  }
}

export async function getNavigationCategory(user?: IUser | null): Promise<ICategoryDetails> {
  const userData = user ? user : await getSavedUserSession();
  const requiredProperties = [
    { key: "AttributeCode", value: "LoginRequired" },
    { key: "AttributeCode", value: "EnableQuoteRequest" },
  ];
  const portalData = await getPortalDetails(requiredProperties);
  const loginRequired = portalData?.loginRequired ? stringToBooleanV2(`${portalData.loginRequired}`) : false;
  const isEnableQuoteRequest = portalData?.enableQuoteRequest ? stringToBooleanV2(`${portalData.enableQuoteRequest}`) : false;
  if (loginRequired && !userData?.userId) return { categories: [], isUserLoggedIn: false ,isEnableQuoteRequest};

  try {
    const filters: IFilterTuple[] = await getMegaMenuFilters();
    const response = convertCamelCase(await getCategoryList(filters));
    const categoriesResponse = mapCategoryList(response);
    return { categories: addBreadcrumbs(categoriesResponse ?? []), isUserLoggedIn: userData && userData.userId && userData.userId > 0 ? true : false ,isEnableQuoteRequest};
  } catch (error) {
    logServer.error(AREA.CATEGORY, `The error occurred in the getNavigationCategory() method and userId:${user?.username} in category.ts file. ${errorStack(error)}`);
    return { categories: [], isUserLoggedIn: false ,isEnableQuoteRequest};
  }
}

export async function getCatalogCode(portalData: IPortalDetail, userDetails?: IUser) {
  const currentUser = userDetails ? userDetails : await getSavedUserSession();
  if (((await getUserProfileId(currentUser as IUser, portalData.profileId, portalData.portalFeatureValues)) || 0) > 0) {
    return await getProfilePublishCatalogCode(currentUser as IUser, portalData);
  } else if (currentUser && (currentUser?.accountId ?? 0) > 0 && currentUser?.catalogCode != null) {
    return currentUser.catalogCode;
  } else if (!currentUser) {
    return await getStoreCatalogCode(portalData);
  } else return portalData?.catalogCode;
}

export async function getStoreCatalogCode(portalData: IPortalDetail) {
  if ((portalData?.profileId || 0) >= 0 && portalData?.portalFeatureValues?.enableProfileBasedSearch === true && portalData?.portalProfileCatalogId) {
    return portalData?.portalProfileCatalogCode as string;
  } else {
    return portalData?.catalogCode;
  }
}

export async function getProfilePublishCatalogCode(currentUser: IUser | undefined, portalData: IPortalDetail | undefined) {
  const profile = currentUser?.profiles?.find((profile: IProfile) => profile.isDefault === true);
  const catalogCode = profile?.catalogCode;
  if (catalogCode != null && catalogCode !== undefined) return catalogCode;
  else return portalData?.catalogCode;
}

//For SubCategories
export async function getSubCategoriesData(props: IBaseWidget, portalData: IPortalDetail, userData: IUser | null) {
  try {
    const catalogCode = await getCatalogCode(portalData);
    const catalogId = await getUserCatalogId(
      portalData.publishCatalogId,
      portalData.portalProfileCatalogId,
      portalData.profileId,
      portalData.portalFeatureValues,
      userData as IUser
    );
    const categoryData = await getSubCategories(props, portalData.portalId, portalData.localeId, catalogId || 0, catalogCode, portalData.storeCode);
    return categoryData;
  } catch (error) {
    logServer.error(AREA.CATEGORY, `The error occurred in the getSubCategoriesData() and requested parameters are cmsMappingId:${props?.cmsMappingId}, widgetCode:${props?.widgetCode}, portalId:${portalData?.portalId}, localeId:${portalData?.localeId}, storeCode:${portalData.storeCode} method in category.ts file. ${errorStack(error)}`);
    return [];
  }
}

/**
 * Get sub categories list for webstore.
 * @returns list of sub categories.
 */
export async function getSubCategories(category: IBaseWidget, portalId: number, localeId: number, publishCatalogId: number, catalogCode?: string, storeCode?: string) {
  try {
    const expands = new ExpandCollection();
    expands.add(ExpandKeys.Seo);
    const categoryId = category.cmsMappingId;
    const sortCollection: { [key: string]: string } = {};
    sortCollection["displayOrder"] = "asc";
    const pageSize = SETTINGS.DEFAULT_PAGE_SIZE;
    const pageIndex = SETTINGS.DEFAULT_PAGE_INDEX;
    const filters: FilterTuple[] = await getSubCategoriesFilters(portalId, localeId, publishCatalogId, Number(categoryId));
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL},${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.DYNAMIC_TAG}`, storeCode || "", catalogCode || "", "PublishedCategories")
    );
    const categoriesList = await PublishCategories_publishedCategories(expands, filters, sortCollection, pageIndex, pageSize, cacheInvalidator.filterTupleArray as FilterTuple[]);
    const publishCategoriesList = convertCamelCase(categoriesList);
    return publishCategoriesList?.publishCategories?.map((categoryItem: ICategory) => mapCategoryData(categoryItem)) || [];
  } catch (error) {
    logServer.error(AREA.CATEGORY, `The error occurred in the getSubCategories() method with parameters categoryId:${category?.cmsMappingId}, portalId:${portalId}, localeId:${localeId}, publishCatalogId:${publishCatalogId}, catalogCode:${catalogCode}, storeCode:${storeCode} in category.ts file. ${errorStack(error)}`);
    return [];
  }
}

/**
 * Get sub category filters.
 * @param portalId
 * @param localeId
 * @param catalogId
 * @param CMSMappingId
 * @returns filters.
 */
export async function getSubCategoriesFilters(portalId: number, localeId: number, catalogId: number, CMSMappingId: number) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, catalogId.toString());
  if (localeId > 0) filters.add(FilterKeys.LocaleId, FilterOperators.Equals, localeId.toString());
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  filters.add(FilterKeys.ZnodeParentCategoryIds, FilterOperators.Contains, String(CMSMappingId));
  filters.add(FilterKeys.IsCallFromWebstore, FilterOperators.Equals, "true");
  return filters.filterTupleArray;
}

export async function getMegaMenuFilters() {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.ZnodeParentCategoryIds, FilterOperators.Equals, String(COMMON.TRUE_VALUE));
  return filters.filterTupleArray;
}

export async function getMegaMenuCategoryFilters(isAllCategory: boolean, categoryCode?: string) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.IsAllCategory, FilterOperators.Equals, String(isAllCategory));
  categoryCode && filters.add(FilterKeys.CategoryCode, FilterOperators.Equals, `"${categoryCode}"`);

  return filters.filterTupleArray;
}
