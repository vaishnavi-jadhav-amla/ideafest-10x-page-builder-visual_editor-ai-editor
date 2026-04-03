//this file name has invalid naming convention. needs to be changed after removing the dependencies

import { generateDomainBasedToken, getPortalHeader } from "@znode/utils/server";

import { FilterTuple } from "../../types/multifront-types";
/* eslint-disable no-unused-vars */
import { HEADERS } from "@znode/constants/headers";
import { getSavedUserSession } from "@znode/utils/common";

export interface FilterParams {
  expand?: string[];
  filter?: FilterTuple[];
  sort?: { [key: string]: string };
  pageSize?: number;
  pageIndex?: number;
  cMSMappingId?: number;
  localeId?: number;
  blogNewsType?: string;
  activationDate?: string;
  portalId?: number;
  widgetKey?: string;
  typeOfMapping?: string;
  profileId?: number;
  publishCatalogId?: number;
  widgetCode?: string;
  seoType?: string;
  seoId?: number;
  seoURL?: string;
  pageNumber?: number;
  catalogId?: number;
  widgetCodes?: string;
  keyword?: string;
  sKUs?: string;
  catalogCode?: string;
  storeCode?: string;
  localeCode?: string;
}

export function buildEndpointQueryString(filterParams: FilterParams) {
  const {
    expand,
    filter,
    sort,
    pageIndex,
    pageSize,
    cMSMappingId,
    portalId,
    widgetKey,
    typeOfMapping,
    profileId,
    publishCatalogId,
    widgetCode,
    seoType,
    seoId,
    seoURL,
    blogNewsType,
    activationDate,
    catalogId,
    widgetCodes,
    keyword,
    sKUs,
    localeCode,
    catalogCode,
    storeCode,
  } = filterParams;

  let queryString = "";
  const queryComponents = [];

  if (expand) queryComponents.push(BuildExpandQueryString(expand));
  if (filter && filter.length > 0) queryComponents.push(BuildFilterQueryString(filter));
  if (sort) queryComponents.push(BuildSortQueryString(sort));
  if (pageIndex) queryComponents.push(BuildPageIndexQueryString(pageIndex));
  if (pageSize) queryComponents.push(BuildPageSizeQueryString(pageSize));
  if (cMSMappingId) queryComponents.push(BuildCMSMappingIdQueryString(cMSMappingId));
  if (portalId) queryComponents.push(BuildPortalIdQueryString(portalId));
  if (widgetKey) queryComponents.push(BuildWidgetKeyQueryString(widgetKey));
  if (typeOfMapping) queryComponents.push(BuildTypeOfMappingQueryString(typeOfMapping));
  if (profileId) queryComponents.push(BuildProfileIdQueryString(profileId));
  if (publishCatalogId) queryComponents.push(BuildPublishCatalogIdQueryString(publishCatalogId));
  if (widgetCode) queryComponents.push(BuildWidgetCodeQueryString(widgetCode));
  if (seoType) queryComponents.push(BuildSeoTypeQueryString(seoType));
  if (seoId) queryComponents.push(BuildSeoIdQueryString(seoId));
  if (catalogId) queryComponents.push(BuildCatalogIdQueryString(catalogId));
  if (seoURL) queryComponents.push(BuildSeoUrlQueryString(seoURL));
  if (blogNewsType) queryComponents.push(BuildBlogNewsTypeQueryString(blogNewsType));
  if (activationDate) queryComponents.push(BuildActivationDateQueryString(activationDate));
  if (sKUs) queryComponents.push(BuildSkusQueryString(sKUs));
  if (localeCode) queryComponents.push(BuildLocaleCodeQueryString(localeCode));
  if (storeCode) queryComponents.push(BuildStoreCodeQueryString(storeCode));
  if (catalogCode) queryComponents.push(BuildCatalogCodeQueryString(catalogCode));
  if (queryComponents.length > 0) queryString = "?" + queryComponents.join("&");

  return queryString;
}

export function BuildExpandQueryString(expand: string[]) {
  let queryString = "expand=";
  expand.forEach((item) => {
    queryString += encodeURIComponent("" + item) + ",";
  });
  queryString = queryString.slice(0, -1);
  return queryString;
}

export function BuildSortQueryString(sort?: { [key: string]: string }) {
  let queryString = "sort=";
  for (const key in sort) {
    queryString += encodeURIComponent("" + key + "~" + sort[key]);
  }
  return queryString;
}

export function BuildWidgetKeyQueryString(widgetKey?: string) {
  let queryString = "widgetKey=";
  queryString += encodeURIComponent("" + widgetKey);
  return queryString;
}

export function BuildTypeOfMappingQueryString(typeOfMapping?: string) {
  let queryString = "typeOfMapping=";
  queryString += encodeURIComponent("" + typeOfMapping);
  return queryString;
}

export function BuildWidgetCodeQueryString(widgetCode?: string) {
  let queryString = "widgetCode=";
  queryString += encodeURIComponent("" + widgetCode);
  return queryString;
}
export function BuildLocaleCodeQueryString(localeCode?: string) {
  let queryString = "localeCode=";
  queryString += encodeURIComponent("" + localeCode);
  return queryString;
}
export function BuildCatalogCodeQueryString(catalogCode?: string) {
  let queryString = "catalogCode=";
  queryString += encodeURIComponent("" + catalogCode);
  return queryString;
}
export function BuildFilterQueryString(filter: FilterTuple[]) {
  let queryString = "filter=";
  filter.forEach((filter: FilterTuple) => {
    for (const attr in filter) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryString += encodeURIComponent("" + (filter as any)[attr] + "~");
    }
    queryString = queryString.slice(0, -1) + ",";
  });
  queryString = queryString.slice(0, -1);
  return queryString;
}

export function BuildPageIndexQueryString(pageIndex: number) {
  return "pageIndex=" + encodeURIComponent("" + pageIndex);
}

export function BuildPageSizeQueryString(pageSize: number) {
  return "pageSize=" + encodeURIComponent("" + pageSize);
}
export function BuildCMSMappingIdQueryString(cMSMappingId: number) {
  return "cMSMappingId=" + encodeURIComponent("" + cMSMappingId);
}
export function BuildLocaleIdQueryString(localeId: number) {
  return "localeId=" + encodeURIComponent("" + localeId);
}
export function BuildActivationDateQueryString(activationDate: string) {
  return "activationDate=" + encodeURIComponent("" + activationDate);
}
export function BuildBlogNewsTypeQueryString(blogNewsType: string) {
  return "blogNewsType=" + encodeURIComponent("" + blogNewsType);
}

export function BuildPortalIdQueryString(portalId: number) {
  return "portalId=" + encodeURIComponent("" + portalId);
}

export function BuildProfileIdQueryString(profileId: number) {
  return "profileId=" + encodeURIComponent("" + profileId);
}

export function BuildPublishCatalogIdQueryString(publishCatalogId: number) {
  return "publishCatalogId=" + encodeURIComponent("" + publishCatalogId);
}

export function BuildSeoTypeQueryString(seoType: string) {
  return "seoType=" + encodeURIComponent("" + seoType);
}

export function BuildSeoIdQueryString(seoId: number) {
  return "seoId=" + encodeURIComponent("" + seoId);
}

export function BuildCatalogIdQueryString(catalogId: number) {
  return "catalogId=" + encodeURIComponent("" + catalogId);
}

export function BuildSeoUrlQueryString(seoURL: string) {
  return "seoURL=" + encodeURIComponent("" + seoURL);
}

export function BuildSkusQueryString(skus: string) {
  return "sKUs=" + encodeURIComponent("" + skus);
}

export function BuildStoreCodeQueryString(storeCode: string) {
  return "storeCode=" + encodeURIComponent("" + storeCode);
}

export function getHeaders(requestType: string, baseUrl = "", isUserIdRequired: boolean = true, contentType: "Json" | "FormData" = "Json"): Promise<HeadersInit> {
  return getApiHeaders(requestType, isUserIdRequired, contentType);
}
//Assigning the header's values.
export async function getApiHeaders(requestType: string, isUserIdRequired: boolean = true, contentType: "Json" | "FormData" = "Json"): Promise<HeadersInit> {
  const requestHeaders: HeadersInit = new Headers();

  if (contentType === "Json") {
    if (requestType?.toLowerCase() === "post" || requestType?.toLowerCase() === "put") requestHeaders.set("Content-Type", "application/json-patch+json");
  }
  const headers = await getPortalHeader();
  if (headers) {
    requestHeaders.set(HEADERS.STORE_CODE, String(headers.storeCode));
    requestHeaders.set(HEADERS.LOCALE_CODE, String(headers.localeCode));
    requestHeaders.set(HEADERS.PUBLISH_STATE, String(headers.publishState));
    requestHeaders.set(HEADERS.ACCEPT, "text/plain");
    requestHeaders.set(HEADERS.CACHE_CONTROL, "no-store");
    requestHeaders.set(HEADERS.AUTHORIZATION, "basic " + generateDomainBasedToken());
    requestHeaders.set(HEADERS.DOMAIN_NAME, 'webstore-z10-int.znodecorp.com');
  }

  // if (isUserIdRequired && user?.userId) {
  if (isUserIdRequired) {
    const user = await getSavedUserSession();
    user?.userId && requestHeaders.set(HEADERS.ZNODE_USER_ID, user?.userId?.toString() || "");
    user?.accountId && requestHeaders.set(HEADERS.ZNODE_ACCOUNT_ID, user?.accountId?.toString() || "");
  }
  return requestHeaders;
}

export function extractCacheTags(cacheIndex: number, filter: FilterTuple[]): string[] {
  const cacheTags = filter[cacheIndex]?.filterValue?.split(",") ?? [];
  let updatedCacheTags = cacheTags.map((tag) => `webstore${tag.trim()}`);
  updatedCacheTags = [...updatedCacheTags, "webstoreGlobal"];
  // remove the cacheTags filter.
  filter.splice(cacheIndex, 1);
  return updatedCacheTags;
}

export function addCacheOption(filter: FilterTuple[], options?: RequestInit): RequestInit {
  // check is cache filter is added.
  const cacheIndex = filter?.findIndex((obj) => obj["filterName"] === "CacheTags");
  const isServer = typeof window === "undefined";

  // check if the caching is on and if this is a server call and check if the filter contains any cache filter
  // if cache filter contains then it will be removed.
  if ((process.env.ENABLE_CACHE !== "true" || !isServer) && cacheIndex != -1) {
    filter.splice(cacheIndex, 1);
    return { ...options };
  }

  // check if the caching is on and if it is a server call.
  if (process.env.ENABLE_CACHE !== "true" || !isServer) {
    const cacheOptions: RequestInit = {
      cache: "no-store",
    };
    return { ...options, ...cacheOptions };
  }

  if (cacheIndex != -1) {
    const cacheTags = extractCacheTags(cacheIndex, filter);
    const cacheOptions: RequestInit = {
      cache: "force-cache",
      next: { tags: cacheTags },
    };
    return { ...options, ...cacheOptions };
  }

  const cacheOptions: RequestInit = {
    next: { revalidate: 0 },
  };
  // eslint-disable-next-line no-unused-vars
  return { ...options, ...cacheOptions };
}
