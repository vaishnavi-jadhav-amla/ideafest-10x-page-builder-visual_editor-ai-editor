import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CategoryBySearchTerm_categoryBySearchTerm, FilterTuple, Searches_fullTextSearchBySearchKeyword } from "@znode/clients/v2";
import { ExpandCollection, convertCamelCase, getPortalHeader } from "@znode/utils/server";
import { IProductListRequest, IPromotion } from "@znode/types/product";
import { ISearchReportModel, ISearchResponse, ISearchTerm } from "@znode/types/search-term";
import { getAttributeValue, getSavedUserSession, stringToBooleanV2 } from "@znode/utils/common";
import { getCatalogCode, getCategoryExpands, getFullTextSearchFilter } from "../category";
import { getFacetFilter, getSortByProductList } from "../product";

import { APP } from "@znode/constants/app";
import { IAttributeDetails } from "@znode/types/attribute";
import { ICategory } from "@znode/types/category";
import { IFacets } from "@znode/types/facet";
import { IFilterTuple } from "@znode/types/filter";
import { IPortalDetail } from "@znode/types/portal";
import { ISearchCMSPages } from "@znode/types/keyword-search";
import { ISearchParams } from "@znode/types/search-params";
import { IUser } from "@znode/types/user";
import { PRODUCT } from "@znode/constants/product";
import { SearchReports_searchReport } from "@znode/clients/v2";
import { fullTextContentPageSearch } from "./search";
import { getFilteredProductData } from "./search-mapper";
import { getPortalDetails } from "../portal";
import { getUserCatalogId } from "../user";
import { mapPromotionValues } from "../product/mapper";

// Get search result on the basis of searchTerm.
export async function getSearchResult(searchParams: ISearchParams): Promise<ISearchTerm | null> {
  try {
    const portalDataFromDetails: IPortalDetail = await getPortalDetails();
    const portalHeader = (await getPortalHeader()) || {};
    const portalData: IPortalDetail = {
      ...portalDataFromDetails,
      localeCode: portalHeader.localeCode,
      localeId: portalHeader.localeId,
    };
    const expand: ExpandCollection = await getCategoryExpands();
    const userData = await getSavedUserSession();
    const isLoginRequiredForPricingAndInventory =
      portalData.globalAttributes &&
      portalData.globalAttributes.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase())?.attributeValue;
    const displayAllWarehousesStock =
      portalData.globalAttributes && portalData.globalAttributes.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase())?.attributeValue;
    const { portalId, publishCatalogId, profileId, portalProfileCatalogId, portalFeatureValues, isProductInheritanceEnabled } = portalData || {};
    const userCatalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData || {});
    const filters: IFilterTuple[] = getFullTextSearchFilter(portalId, displayAllWarehousesStock, isProductInheritanceEnabled ?? false);
    const productListModel: IProductListRequest = await bindSearchModel(userCatalogId || 0, searchParams, portalData);
    const isEnableCMSPageSearch = portalData.portalFeatureValues?.enableCMSPageResults;
    let productList = {} as ISearchResponse;
    let searchCMSPagesData = { cmsPages: [], totalCMSPageCount: 0 } as ISearchCMSPages;
    if (isEnableCMSPageSearch) {
      const userProfileId = userData?.profileId || portalData?.profileId;
      const [productListResponse, searchCMSPageResponse] = await Promise.allSettled([
        getSearchedProducts(expand, filters, productListModel, searchParams, portalData),
        fullTextContentPageSearch(searchParams, filters, portalData?.storeCode, portalData?.localeCode, userProfileId),
      ]);
      if (productListResponse.status === "fulfilled") productList = productListResponse.value;
      else logServer.error(AREA.SEARCH, "Error fetching products.", { error: productListResponse.reason });
      if (searchCMSPageResponse.status === "fulfilled") searchCMSPagesData = searchCMSPageResponse.value;
      else logServer.error(AREA.SEARCH, "Error fetching CMS pages.", { error: searchCMSPageResponse.reason });
    } else {
      const productListResponse: ISearchResponse = (await getSearchedProducts(expand, filters, productListModel, searchParams, portalData)) || {};
      productList = productListResponse;
    }
    saveSearchReportData(searchParams?.searchTerm, portalData, productList, userData || {});
    productList.sortList = portalData.sortList;
    productList.pageList = portalData.pageList;
    if (productList.hasError) {
      const filteredProductData = {
        productList: [],
        totalProducts: 0,
        searchProfileId: null,
        totalCmsPages: 0,
        pageNumber: null,
        pageSize: null,
      };
      return {
        filteredProductData: filteredProductData,
        associatedCategoryList: [],
        filteredAttribute: [],
        searchCMSPagesData: searchCMSPagesData as ISearchCMSPages,
        enableCMSPageSearch: isEnableCMSPageSearch || false,
        isEnableCompare: portalData.enableCompare,
      } as ISearchTerm;
    }
    return await bindCategoryFacet(
      productList,
      searchCMSPagesData,
      isEnableCMSPageSearch || false,
      isLoginRequiredForPricingAndInventory,
      displayAllWarehousesStock,
      portalData.enableCompare
    );
  } catch (error) {
    logServer.error(AREA.SEARCH, errorStack(error));
    return null;
  }
}

//bind the search parameters.
export async function bindSearchModel(catalogId: number, searchParams: ISearchParams, portalData: IPortalDetail): Promise<IProductListRequest> {
  const pageValue: number = portalData.pageList?.find((m) => m.isDefault === true)?.pageValue ?? 16;

  const productListModel: IProductListRequest = {
    PageNumber: Number(searchParams?.pageNumber) || 1,
    PageIndex: Number(searchParams?.pageIndex) || 1,
    PageSize: Number(searchParams?.pageSize) || pageValue,
    CatalogId: catalogId,
    IsFacetList: true,
    Keyword: searchParams?.searchTerm,
    LocaleId: portalData?.localeId,
    PortalId: portalData?.portalId,
    RefineBy: await getFacetFilter(searchParams),
    UseSuggestion: true,
    IsProductInheritanceEnabled: portalData?.portalFeatureValues?.enableProductInheritance,
  };

  return productListModel;
}

export async function bindCategoryFacet(
  searchResult: ISearchResponse,
  searchCMSPagesData: ISearchCMSPages,
  isEnableCMSPageSearch?: boolean,
  loginToSeePricingAndInventory?: string,
  displayAllWarehousesStock?: string,
  isEnableCompare?: boolean
) {
  const filteredProductList = getFilteredProductData(searchResult);
  const filteredAttribute =
    searchResult.facets && searchResult?.facets.length > 0
      ? searchResult?.facets.map((val: IFacets) => {
          return { attributeValues: val?.attributeValues, attributeName: val?.attributeName, attributeCode: val?.attributeCode };
        })
      : [];

  return {
    filteredProductData: { ...filteredProductList, loginToSeePricingAndInventory, displayAllWarehousesStock },
    associatedCategoryList: [] as ICategory[],
    filteredAttribute,
    enableCMSPageSearch: isEnableCMSPageSearch,
    searchCMSPagesData: searchCMSPagesData as ISearchCMSPages,
    isEnableCompare,
  } as unknown as ISearchTerm;
}

export async function getSearchedProducts(
  expand: ExpandCollection,
  filters: IFilterTuple[],
  productListModel: IProductListRequest,
  searchParams: ISearchParams,
  portalData: IPortalDetail
) {
  const sortValue = await getSortByProductList(Number(searchParams?.sort));
  const catalogCode = await getCatalogCode(portalData);
  const refineBy = JSON.stringify(productListModel.RefineBy);

  const categoryProducts: ISearchResponse = convertCamelCase(
    (await Searches_fullTextSearchBySearchKeyword(
      searchParams?.searchTerm || "",
      searchParams?.categoryCode || "",
      portalData?.localeCode || APP.DEFAULT_LOCALE,
      catalogCode || "",
      portalData?.storeCode,
      true,
      false,
      portalData?.isProductInheritanceEnabled ?? false,
      expand,
      filters as FilterTuple[],
      sortValue,
      productListModel?.PageNumber,
      productListModel?.PageSize,
      refineBy
    )) || {}
  );

  if (categoryProducts && categoryProducts.products) {
    for (const product of categoryProducts.products) {
      const promotions: IPromotion[] = product.promotions ? mapPromotionValues(product.promotions) : [];
      product.promotions = promotions;
      product.isObsolete = stringToBooleanV2(getAttributeValue(product.attributes as IAttributeDetails[], PRODUCT.IS_OBSOLETE, "attributeValues"));
    }
  }

  return categoryProducts;
}

export async function saveSearchReportData(searchTerm: string | undefined, portalData: IPortalDetail, categoryResult: ISearchResponse, userData: IUser) {
  const searchReportModel: ISearchReportModel = {
    StoreCode: portalData?.storeCode || "",
    UserId: userData.userId || 2,
    UserProfileId: (userData.profiles && userData.profiles.at(0)?.profileId) || undefined,
    SearchProfileId: categoryResult?.searchProfileId || 1,
    ResultCount: Number(categoryResult?.paginationDetail?.totalResults || 0),
    SearchKeyword: searchTerm,
    TransformationKeyword: categoryResult?.suggestTerm,
  };
  const saveSearchReportData = await SearchReports_searchReport(searchReportModel);
  return saveSearchReportData;
}

export async function getCategoryListBySearchTerm(searchTerm: string, categoryCodes: string) {
  try {
    const decodedCategoryCode = decodeURIComponent(categoryCodes);
    const categoryCodeList = decodedCategoryCode.split(">");
    const categoryCode = categoryCodeList[categoryCodeList.length - 1];
    const portalData = await getPortalDetails();
    const { storeCode, localeCode } = portalData || {};
    const catalogCode = (await getCatalogCode(portalData)) || "";
    const categoryResponse = convertCamelCase(
      await CategoryBySearchTerm_categoryBySearchTerm(searchTerm, categoryCode, decodedCategoryCode, catalogCode, storeCode || "", localeCode || "")
    );
    if (categoryResponse?.hasError) {
      logServer.error(AREA.Facet, "Error in fetching category data", { errorDetails: categoryResponse });
      return { categories: [], parentCategories: [], isProductInheritanceEnabled: false };
    }
    return categoryResponse;
  } catch (error) {
    logServer.error(AREA.Facet, "Error occurred in getCategoryListBySearchTerm function.", { errorStack: errorStack(error) });
    return { categories: [], parentCategories: [], isProductInheritanceEnabled: false };
  }
}
