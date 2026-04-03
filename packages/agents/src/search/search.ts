import { AREA, errorStack, logServer } from "@znode/logger/server";
import {
  CMSSearchConfigurations_cmsSearchConfigurations,
  FilterTuple,
  HydratedTypeaheadSearchCategoryResponse,
  Searches_hydratedTypeaheadFullTextSearchBySearchKeyword,
  Searches_productsPricingBySkus,
  Searches_suggestionByKeyword,
} from "@znode/clients/v2";
import {
  ExpandCollection,
  ExpandKeys,
  FilterCollection,
  FilterKeys,
  FilterOperators,
  convertCamelCase,
  convertPascalCase,
  createFilterTuple,
  generateTagName,
} from "@znode/utils/server";
import {
  HydratedSearchBrandResponse,
  HydratedSearchCategoryResponse,
  HydratedSearchContentResponse,
  SearchKeywords_searchKeywords,
  SearchSettings_hydratedSearchGetBySearchTerm,
  SearchSettings_hydratedSearchGetByStoreCode,
} from "@znode/clients/v2";
import { ICMSPages, ISearchCMSPages } from "@znode/types/keyword-search";
import {
  IHydratedSearchModel,
  IHydratedSearchProductModel,
  ISearchBrand,
  ISearchCategory,
  ISearchCmsPageResponse,
  ISearchContent,
  ISearchKeywordsRedirectListModel,
  ISearchKeywordsRedirectModel,
  ISearchParams,
} from "@znode/types/search-params";
import { getCatalogCode, getCategoryFilters } from "../category";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { IFilterTuple } from "@znode/types/filter";
import { SEARCH } from "@znode/constants/search";
import { getPortalDetails } from "../portal";
import { getSavedUserSession } from "@znode/utils/common";

export async function getSuggestions(keyword: string, portalId: number, localeId: number, localeCode: string, storeCode: string, catalogCode: string, publishCatalogId?: number) {
  try {
    const filters: IFilterTuple[] = getCategoryFilters(portalId, localeId, publishCatalogId || 0);
    const searchData = await Searches_suggestionByKeyword(keyword, true, storeCode, localeCode, catalogCode, filters as FilterTuple[], undefined, undefined, undefined, undefined);
    const searchDetails = convertCamelCase(searchData?.Search);
    if (searchDetails?.products) {
      return searchDetails?.products;
    }
    return null;
  } catch (error) {
    logServer.error(AREA.SEARCH, error as string);
    return null;
  }
}

export async function checkURLExistForSearchTerm(searchTerm: string, publishCatalogId: number) {
  try {
    if (searchTerm && publishCatalogId) {
      const filters: IFilterTuple[] = [];

      filters.push(createFilterTuple(FilterKeys.PublishCatalogId, FilterOperators.Equals, publishCatalogId?.toString()));
      filters.push(createFilterTuple(FilterKeys.Keywords, FilterOperators.Contains, searchTerm));

      const searchRedirectList = await SearchKeywords_searchKeywords(convertPascalCase(filters), undefined, undefined, undefined);
      const searchList = convertCamelCase(searchRedirectList);
      const updatedKeywordsList: ISearchKeywordsRedirectModel[] = getUpdatedKeywordList(searchList);
      if (updatedKeywordsList?.length > 0) {
        searchList.keywordsList.push(...updatedKeywordsList);
      }
      const keywordsList = searchList?.keywordsList ?? [];
      const foundKeyword = keywordsList.find((x: ISearchKeywordsRedirectModel) => x.keywords.toLowerCase() === searchTerm?.toLowerCase().trim());
      return foundKeyword?.url ?? "";
    }
    return "";
  } catch (error) {
    logServer.error(AREA.SEARCH, errorStack(error));
    return "";
  }
}

function getUpdatedKeywordList(list: ISearchKeywordsRedirectListModel): ISearchKeywordsRedirectModel[] {
  const updatedKeywordList = list?.keywordsList
    ?.flatMap((item: { keywords: string; url: string }) => item.keywords.split(",").map((keyword: string) => ({ keywords: keyword.trim(), url: item.url })))
    ?.filter((item: { keywords: string }) => item.keywords !== "");
  return updatedKeywordList;
}

export async function fullTextContentPageSearch(searchParams: ISearchParams, filters: IFilterTuple[], storeCode?: string, localeCode?: string, userProfileId?: number) {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, storeCode || "", "CmsSearchConfigurations")
    );
    const fullTextContentPageData = convertCamelCase(
      (await CMSSearchConfigurations_cmsSearchConfigurations(
        storeCode || "",
        localeCode || "",
        searchParams?.searchTerm || "",
        undefined,
        cacheInvalidator.filterTupleArray as FilterTuple[]
      )) || {}
    );
    const mapCMSPages = (cmsPages: ICMSPages[]) => {
      return (
        cmsPages?.map((cmsPage: ICMSPages) => ({
          seoTitle: cmsPage.seoTitle,
          seoDescription: cmsPage.seoDescription,
          seoUrl: cmsPage.seoUrl,
          pageTitle: cmsPage.pageTitle,
          contentPageId: cmsPage.contentPageId,
        })) || []
      );
    };

    if (fullTextContentPageData?.cmsPages) {
      if (userProfileId != null) {
        const filteredPages = fullTextContentPageData.cmsPages.filter(
          (page: ISearchCmsPageResponse) => Array.isArray(page?.profileId) && (page?.profileId?.includes(userProfileId) || page?.profileId?.includes(0))
        );
        const cmsPageData = {
          cmsPages: mapCMSPages(filteredPages),
          totalCMSPageCount: filteredPages.length,
        };
        return cmsPageData;
      }
      const cmsPageData = {
        cmsPages: mapCMSPages(fullTextContentPageData.cmsPages),
        totalCMSPageCount: fullTextContentPageData.totalCMSPageCount,
      };
      return cmsPageData;
    }
    return { cmsPages: [], totalCMSPageCount: 0 };
  } catch (error) {
    logServer.error(AREA.SEARCH, errorStack(error));
    return {} as ISearchCMSPages;
  }
}

export async function getHydratedSearchContent(catalogCode: string, userProfileId: number, storeCode: string, localeCode: string) {
  try {
    if (storeCode && localeCode && catalogCode && userProfileId) {
      const profileId = userProfileId;

      const hydratedSearchContent = await SearchSettings_hydratedSearchGetByStoreCode(storeCode, localeCode, catalogCode, profileId);

      const categoryData: ISearchCategory[] = createCategoryData(hydratedSearchContent?.HydratedSearchCategoryList || []);
      const brandData: ISearchBrand[] = createBrandData(hydratedSearchContent?.HydratedSearchBrandList || []);
      const contentData: ISearchContent[] = createContentData(hydratedSearchContent?.HydratedSearchContentList || []);

      return {
        hydratedSearchProductList: convertCamelCase(hydratedSearchContent?.HydratedSearchProductList),
        hydratedSearchCategoryList: categoryData,
        hydratedSearchBrandList: brandData,
        hydratedSearchContentList: contentData,
        hydratedSearchActivityList: convertCamelCase(hydratedSearchContent?.HydratedSearchActivityList),
        totalProductCount: hydratedSearchContent.TotalProductCount,
        isMySearchesEnabled: hydratedSearchContent.IsMySearchesEnabled,
        mySearchesResultCount: hydratedSearchContent.MySearchesResultCount,
      } as IHydratedSearchModel;
    }
    return {} as IHydratedSearchModel;
  } catch (error) {
    logServer.error(AREA.SEARCH, errorStack(error));
    return {} as IHydratedSearchModel;
  }
}

export async function getHydratedTypeaheadSearchContent(
  keyword: string,
  catalogCode: string,
  userId: number,
  storeCode: string,
  localeCode: string,
  portalId: number,
  userProfileId: number,
  categoryCode?: string,
  refineBy?: string,
  isTypeaheadSearchEnabled?: boolean
) {
  try {
    const expand: ExpandCollection = await getTypeaheadExpands();
    const filter: IFilterTuple[] = getTypeaheadFilter(portalId);
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CATALOG}`, storeCode || "", catalogCode || ""));
    if (isTypeaheadSearchEnabled) {
      if (storeCode && localeCode && catalogCode) {
        const hydratedSearchContent = await Searches_hydratedTypeaheadFullTextSearchBySearchKeyword(
          keyword || "",
          catalogCode,
          storeCode,
          localeCode,
          categoryCode || "",
          true,
          refineBy || "",
          userId || 0,
          expand || undefined,
          (filter as FilterTuple[]) || undefined,
          undefined,
          1,
          undefined,
          undefined
        );

        const hydratedTypeaheadSearchContent = convertCamelCase(hydratedSearchContent);
        const skus: string[] = hydratedTypeaheadSearchContent.products?.map((product: IHydratedSearchProductModel) => product.sku) ?? [];
        const hydratedSkuList = skus;

        const categoryData: ISearchCategory[] = createHydratedCategoryData(hydratedSearchContent?.AssociatedCategories || []);

        return {
          hydratedSearchProductList: hydratedTypeaheadSearchContent?.products,
          hydratedSearchActivityList: hydratedTypeaheadSearchContent?.hydratedSearchActivityList,
          hydratedSearchCategoryList: categoryData,
          hydratedFacetList: hydratedTypeaheadSearchContent?.facets,
          totalProductCount: hydratedTypeaheadSearchContent.totalProductCount,
          loginToSeePricing: hydratedTypeaheadSearchContent?.loginToSeePricing,
          hydratedSkuList,
          isAllowIndexing: hydratedTypeaheadSearchContent?.isAllowIndexing,
          isTypeaheadSearchEnabled: isTypeaheadSearchEnabled || false,
        } as IHydratedSearchModel;
      }
    } else {
      const hydratedSearchContent = await SearchSettings_hydratedSearchGetBySearchTerm(keyword.trim(), storeCode, localeCode, catalogCode, userProfileId);
      const categoryData: ISearchCategory[] = createCategoryData(hydratedSearchContent?.HydratedSearchCategoryList || []);
      const brandData: ISearchBrand[] = createBrandData(hydratedSearchContent?.HydratedSearchBrandList || []);
      const contentData: ISearchContent[] = createContentData(hydratedSearchContent?.HydratedSearchContentList || []);

      return {
        hydratedSearchProductList: convertCamelCase(hydratedSearchContent?.HydratedSearchProductList),
        hydratedSearchCategoryList: categoryData,
        hydratedSearchBrandList: brandData,
        hydratedSearchContentList: contentData,
        hydratedSearchActivityList: convertCamelCase(hydratedSearchContent?.HydratedSearchActivityList),
        totalProductCount: hydratedSearchContent.TotalProductCount,
        isMySearchesEnabled: hydratedSearchContent.IsMySearchesEnabled,
        mySearchesResultCount: hydratedSearchContent.MySearchesResultCount,
        isTypeaheadSearchEnabled: isTypeaheadSearchEnabled || false,
      } as IHydratedSearchModel;
    }
    return {} as IHydratedSearchModel;
  } catch (error) {
    logServer.error(AREA.SEARCH, errorStack(error));
    return {} as IHydratedSearchModel;
  }
}

function createCategoryData(hydratedSearchList: HydratedSearchCategoryResponse[]): ISearchCategory[] {
  return hydratedSearchList?.map((searchContent: HydratedSearchCategoryResponse) => {
    let link = "";
    let type = "";

    if (searchContent.CategoryId) {
      link = searchContent.SEOUrl ? `/${searchContent.SEOUrl}` : `/category/${searchContent.CategoryId}`;
      type = SEARCH.CATEGORY;
    }

    return {
      categoryId: searchContent.CategoryId,
      categoryName: searchContent.CategoryName,
      imagePath: searchContent.ImagePath,
      seoUrl: searchContent.SEOUrl,
      link,
      type,
    } as ISearchCategory;
  });
}

function createHydratedCategoryData(hydratedSearchList: HydratedTypeaheadSearchCategoryResponse[]): ISearchCategory[] {
  return hydratedSearchList?.map((searchContent: HydratedTypeaheadSearchCategoryResponse) => {
    return {
      categoryId: searchContent.CategoryId,
      categoryName: searchContent.CategoryName,
      seoUrl: searchContent.SEOUrl,
      categoryCode: searchContent.CategoryCode,
    } as ISearchCategory;
  });
}

function createBrandData(hydratedSearchList: HydratedSearchBrandResponse[]): ISearchBrand[] {
  return hydratedSearchList?.map((searchContent: HydratedSearchBrandResponse) => {
    let link = "";
    let type = "";

    if (searchContent.BrandId) {
      link = `/brand/${searchContent.BrandCode}`;
      type = SEARCH.BRAND;
    }

    return {
      brandId: searchContent.BrandId,
      brandCode: searchContent.BrandCode,
      brandName: searchContent.BrandName,
      imagePath: searchContent.ImagePath,
      seoUrl: searchContent.SEOUrl,
      link,
      type,
    } as ISearchBrand;
  });
}

function createContentData(hydratedSearchList: HydratedSearchContentResponse[]): ISearchContent[] {
  return hydratedSearchList?.map((searchContent: HydratedSearchContentResponse) => {
    let link = "";
    if (SEARCH.CONTENT_PAGE_NAME in searchContent) {
      link = `/search/search-term/${searchContent.ContentPageName}?activeTab=pagesTab`;
    }
    return {
      contentPageId: searchContent.ContentPageId,
      contentPageName: searchContent.ContentPageName,
      seoUrl: searchContent.SEOUrl,
      link,
    } as ISearchContent;
  });
}

/**
 * Get expand keys for typeaheadSearch.
 * @returns the expand keys for typeaheadSearch.
 */
export async function getTypeaheadExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Pricing);
  expands.add(ExpandKeys.Seo);
  expands.add(ExpandKeys.Facet);
  return expands;
}

export function getTypeaheadFilter(portalId: number) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId?.toString());
  return filters.filterTupleArray;
}

/*This method is used to bind pricing details for typeahead product model.
 * @returns the updated product model for typeahead search.
 */
export async function bindProductPricingData(skuList: string, isCacheDisabled = false) {
  const portalData = await getPortalDetails();
  const { userId } = (await getSavedUserSession()) || {};
  const catalogCode = await getCatalogCode(portalData);
  const cacheInvalidator = new FilterCollection();
  !isCacheDisabled &&
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CATALOG}`, portalData?.storeCode || "", catalogCode || "")
    );
  const priceList = await Searches_productsPricingBySkus(
    skuList,
    portalData.storeCode as string,
    userId || 0,
    portalData.localeCode as string,
    1,
    undefined,
    cacheInvalidator?.filterTupleArray as FilterTuple[]
  );

  const productPricing = convertCamelCase(priceList?.ProductPricingDetailsList);
  return productPricing;
}
