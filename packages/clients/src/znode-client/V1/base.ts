import { convertCamelCase, convertPascalCase, generateDomainBasedToken, getPortalHeader } from "@znode/utils/server";

import { FilterTuple } from "../../types/multifront-types";
import { HEADERS } from "@znode/constants/headers";
import { getSavedUserSession } from "@znode/utils/common";

export interface IFilterParams {
  expand?: string[];
  filter?: FilterTuple[];
  sort?: { [key: string]: string };
  pageSize?: number;
  pageIndex?: number;
  columnList?: string;
}


// Generic function to call any function with PascalCase input and CamelCase output
export async function callApiWithTransformations<T>(
  apiFunction: (...args: any[]) => Promise<T>, // The API function to call
  ...args: any[] // Any arguments passed to the function
): Promise<T> {
  // Transform input arguments to PascalCase if they are objects
  const transformedArgs = args.map(arg => (typeof arg === 'object' ? convertPascalCase(arg) : arg));

  try {
    // Call the API function with transformed arguments
    const response = await apiFunction(...transformedArgs);

    // Convert the response to camelCase
    const camelCaseResponse = convertCamelCase(response);

    return camelCaseResponse as T;
  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
}

export function buildEndpointQueryString(filterParams: IFilterParams) {
  const { expand, filter, sort, pageIndex, pageSize } = filterParams;

  let queryString = "";
  const queryComponents = [];

  if (expand) queryComponents.push(buildExpandQueryString(expand));
  if (filter && filter.length > 0) queryComponents.push(buildFilterQueryString(filter));
  if (sort) queryComponents.push(buildSortQueryString(sort));
  if (pageIndex) queryComponents.push(buildPageIndexQueryString(pageIndex));
  if (pageSize) queryComponents.push(buildPageSizeQueryString(pageSize));
  if (queryComponents.length > 0) queryString = "?" + queryComponents.join("&");

  return queryString;
}

export function buildExpandQueryString(expand: string[]) {
  let queryString = "expand=";
  expand.forEach((item) => {
    queryString += encodeURIComponent("" + item) + ",";
  });
  queryString = queryString.slice(0, -1);
  return queryString;
}

export function buildSortQueryString(sort?: { [key: string]: string }) {
  let queryString = "sort=";
  for (const key in sort) {
    queryString += encodeURIComponent("" + key + "~" + sort[key]);
  }
  return queryString;
}

export function buildFilterQueryString(filter: FilterTuple[]) {
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

export function buildPageIndexQueryString(pageIndex: number) {
  return "pageIndex=" + encodeURIComponent("" + pageIndex);
}

export function buildPageSizeQueryString(pageSize: number) {
  return "pageSize=" + encodeURIComponent("" + pageSize);
}

export async function getHeaders(requestType: string, baseUrl: string): Promise<HeadersInit> {
  const requestHeaders: HeadersInit = new Headers();
  if (requestType?.toLowerCase() === "post" || requestType?.toLowerCase() === "put") requestHeaders.set("Content-Type", "application/json-patch+json");
  const headers = await getPortalHeader();
  const user = await getSavedUserSession();
  
  if(headers)
    {
      requestHeaders.set(HEADERS.STORE_CODE, String(headers.storeCode));
      requestHeaders.set(HEADERS.LOCALE_CODE, String(headers.localeCode));
      requestHeaders.set(HEADERS.ZNODE_LOCALE_ID, String(headers.localeId));
      requestHeaders.set(HEADERS.PUBLISH_STATE, String(headers.publishState));
      requestHeaders.set(HEADERS.ACCEPT, "text/plain");
      requestHeaders.set(HEADERS.CACHE_CONTROL, "no-store");
      requestHeaders.set(HEADERS.AUTHORIZATION, "basic " + generateDomainBasedToken());
      requestHeaders.set(HEADERS.DOMAIN_NAME, "webstore-preview-z10-dev10.znodecorp.com");
      if (user?.userId)
      requestHeaders.set(HEADERS.ZNODE_ACCOUNT_ID, user?.accountId?.toString()|| "");
    }
  return requestHeaders;
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

export function extractCacheTags(cacheIndex: number, filter: FilterTuple[]): string[] {
  const cacheTags = filter[cacheIndex]?.filterValue?.split(",") ?? [];
  let updatedCacheTags = cacheTags.map((tag) => `webstore${tag.trim()}`);
  updatedCacheTags = [...updatedCacheTags, "webstoreGlobal"];
  // remove the cacheTags filter.
  filter.splice(cacheIndex, 1);
  return updatedCacheTags;
}

export function throwException(message: string, response: string, result?: any): any {
  try {
    if (result !== null && result !== undefined) throw result;
    else throw new Error(message);
  } catch (ex) {
    const parsedRes = response === "" ? null : (JSON.parse(response) as any);
    return parsedRes;
  }
}
