/* eslint-disable @typescript-eslint/no-explicit-any */
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { BrandListModelResponse, BrandModelResponse } from "packages/clients/src/znode-client/V2/multifront-types";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, generateTagName, getPortalHeader } from "@znode/utils/server";
import { PublishBrands_publishedBrandsGet, PublishBrands_publishedBrandsGetByBrandCode, WebStoreWidgets_brandsPublishByWidgetKey } from "@znode/clients/v2";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { FilterTuple } from "@znode/clients/v1";
import { IBrandDetailResponse, IBrandList, IWidgetBrand } from "@znode/types/brand";
import { IFilterTuple } from "@znode/types/filter";
import { getPortalDetails } from "../portal/portal";
import { IWidget } from "@znode/types/widget";
import { BRAND_PAGINATION } from "@znode/constants/pagination";

/**
 * Get Filtered Brand List by Brand Name.
 * @param brandName - The brand name to filter.
 * @param portalData - Portal details.
 * @param publishCatalogId - Catalog ID for filtering (optional).
 * @param cmsMappingId - CMS mapping ID for filtering (optional).
 * @param localeId - Locale ID for filtering (optional).
 * @returns A list of brands or null.
 */
export async function getBrandList(params?: {
  brandName: string;
  pageNumber: number;
  pageSize: number;
}): Promise<{ brandList: { id: number; name: string; code: string; img: string }[]; totalResults: number; pageSize: number } | null> {
  try {
    const { brandName = "", pageNumber = 1, pageSize = BRAND_PAGINATION.find((data) => data.isDefault)?.pageValue || 20 } = params || {};
    const portalHeader = await getPortalHeader();
    const filters: IFilterTuple[] = getBrandFilters(brandName, portalHeader.localeId, portalHeader.portalId);
    const sort = { displayOrder: "ASC" };
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, portalHeader.storeCode || "", "PublishedBrandsGet")
    );
    const brandListResponse: BrandListModelResponse = await PublishBrands_publishedBrandsGet(
      filters as FilterTuple[],
      sort,
      pageNumber,
      pageSize,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    return {
      brandList:
        brandListResponse?.Brands?.map(({ BrandId, BrandName, BrandCode, ImageSmallPath, SEOFriendlyPageName, SEOTitle }: BrandModelResponse) => {
          if (BrandId && BrandName) {
            return {
              id: BrandId,
              name: BrandName,
              code: BrandCode,
              img: ImageSmallPath ?? "",
              seoUrl: SEOFriendlyPageName,
              seoTitle: SEOTitle,
            };
          }
          return null;
        }).filter((brand): brand is { id: number; name: string; code: string; img: string; seoUrl: string; seoTitle: string } => brand !== null) ?? [],
      totalResults: brandListResponse?.PaginationDetail?.TotalResults || 0,
      pageSize: brandListResponse?.PaginationDetail?.PageSize || 0,
    };
  } catch (error) {
    logServer.error(AREA.BRAND, errorStack(error));
    return null;
  }
}

/**
 * Get brand details by brand ID.
 * @param brandId - The ID of the brand.
 * @param portalData - Portal details.
 * @returns Brand details.
 */
export async function getBrandDetails(brandCode: string): Promise<IBrandDetailResponse> {
  try {
    const portalData = await getPortalDetails();
    const storeCode = portalData.storeCode;
    const localeCode = portalData.portalLocales && portalData.portalLocales.at(0)?.code;
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.BRAND_CODE}, ${CACHE_KEYS.DYNAMIC_TAG}`, brandCode, "PublishedBrandsGetByBrandCode")
    );
    const brandDetails = await PublishBrands_publishedBrandsGetByBrandCode(brandCode, storeCode ?? "", localeCode ?? "en-Us", cacheInvalidator.filterTupleArray as FilterTuple[]);
    return convertCamelCase(brandDetails);
  } catch (error) {
    logServer.error(AREA.BRAND, errorStack(error));
    return { brands: { brandName: "", brandCode: "" } } as IBrandDetailResponse;
  }
}

/**
 * Get filters for brand products.
 * @param brandName - The name of the brand for filtering (optional).
 * @param cmsMappingId - CMS mapping ID for filtering (optional).
 * @param portalId - Portal ID for filtering (optional).
 * @param publishCatalogId - Catalog ID for filtering (optional).
 * @param localeId - Locale ID for filtering (optional).
 * @returns An array of filter tuples.
 */
export function getBrandFilters(brandName?: string, localeId?: number, portalId?: number, publishCatalogId?: number, cmsMappingId?: number): IFilterTuple[] {
  const filters: FilterCollection = new FilterCollection();

  // Add filters based on the parameters provided
  if (brandName !== undefined) {
    filters.add(FilterKeys.BrandName, FilterOperators.StartsWith, brandName);
  }

  if (publishCatalogId) {
    filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, publishCatalogId.toString());
  }

  if (localeId) {
    filters.add(FilterKeys.LocaleId, FilterOperators.Equals, localeId.toString());
  }

  if (portalId) {
    filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  }

  if (cmsMappingId) {
    filters.add("ZnodeCategoryId", FilterOperators.Equals, cmsMappingId.toString());
  }

  // Add the IsActive filter as it's a constant value
  filters.add(FilterKeys.IsActive, FilterOperators.Equals, "true");

  return filters.filterTupleArray;
}

export async function getBrandWidgetList(widget: IWidget): Promise<IBrandList | null> {
  try {
    const portalDetails = await getPortalDetails();
    if (!portalDetails) return null;

    const portalData = {
      storeCode: portalDetails.storeCode,
      localeId: portalDetails.localeId,
      portalId: portalDetails.portalId,
      localeCode: portalDetails.localeCode ?? "",
      imageSmallUrl: portalDetails.imageSmallUrl,
      globalAttributes: portalDetails.globalAttributes,
    };

    widget.cmsMappingId = widget?.portalId;

    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CATALOG}`, portalDetails.storeCode || ""));

    const widgetBrandData = await WebStoreWidgets_brandsPublishByWidgetKey(
      widget.widgetKey,
      widget.cmsMappingId,
      portalData.storeCode,
      portalData.localeCode,
      widget.typeOfMapping,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );

    const brandInfo = widgetBrandData ? convertCamelCase(widgetBrandData) : null;
    const widgetBrands = brandInfo?.brands;
    if (!widgetBrands || !Array.isArray(widgetBrands)) return null;

    const data = await getBrandList();
    const brandList = data?.brandList || [];
    const brandListData = new Map(brandList.map((b: { id: number; name: string; code: string; img: string; seoUrl?: string; seoTitle?: string }) => [b.code, b]));

    const brandsData: IWidgetBrand[] = widgetBrands
      .filter((brandWrapper: any) => brandWrapper?.brandModel)
      .map((brandWrapper: any) => {
        const brandModel = brandWrapper.brandModel;
        const brandData = brandListData.get(brandModel.brandCode);

        return {
          brandId: brandData?.id ?? brandModel.brandId,
          brandCode: brandModel.brandCode,
          brandName: brandData?.name ?? brandModel.brandName,
          imageSmallPath: brandData?.img ?? brandModel.imageSmallPath,
          seoTitle: brandData?.seoTitle ?? brandModel.seoTitle,
          seoFriendlyPageName: brandData?.seoUrl ?? brandModel.seoFriendlyPageName,
        };
      });

    const brandListResult: IBrandList = {
      brands: brandsData,
    };

    return brandListResult;
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}
