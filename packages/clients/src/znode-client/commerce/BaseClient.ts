import { CUSTOM_HEADERS } from "@znode/constants/common";
import { IFilterTuple } from "@znode/types/filter";
import { PORTAL_KEYS } from "@znode/constants/portal-keys";
import { generateDomainBasedToken, getPortalHeader } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { headers } from "next/headers";
import { HEADERS } from "@znode/constants/headers";
import { ZnodePublishStatesEnum } from "@znode/types/enums";

export interface FilterParams {
  expand?: string[];
  filter?: IFilterTuple[];
  sort?: { [key: string]: string };
  pageSize?: number;
  pageIndex?: number;
}

export function BuildEndpointQueryString(filterParams: FilterParams) {
  const { expand, filter, sort, pageIndex, pageSize } = filterParams;

  let queryString = "";
  const queryComponents = [];

  if (expand) queryComponents.push(BuildExpandQueryString(expand));
  if (filter && filter.length > 0) queryComponents.push(BuildFilterQueryString(filter));
  if (sort) queryComponents.push(BuildSortQueryString(sort));
  if (pageIndex) queryComponents.push(BuildPageIndexQueryString(pageIndex));
  if (pageSize) queryComponents.push(BuildPageSizeQueryString(pageSize));
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

export function BuildFilterQueryString(filter: IFilterTuple[]) {
  let queryString = "filter=";
  filter.forEach((filter: IFilterTuple) => {
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

export function getHeaders(requestType: string, baseUrl = ""): Promise<HeadersInit> {
  return getApiHeaders(requestType);
}
export async function getApiHeaders(requestType: string, isUserIdRequired: boolean = true): Promise<HeadersInit> {
  const requestHeaders: HeadersInit = new Headers();
  const normalizedRequestType = requestType?.toLowerCase();

  const setHeader = (key: string, value: string | undefined) => {
    if (value) {
      requestHeaders.set(key, value);
    }
  };

  const isModifyRequest = ["post", "put", "delete"].includes(normalizedRequestType);

  if (["post", "put"].includes(normalizedRequestType)) {
    setHeader("Content-Type", "application/json-patch+json");
  }

  const user = await getSavedUserSession();
  const profileId = Number(user?.profileId) > 0 ? user?.profileId : user?.profiles?.at(0)?.profileId;

  const headers = await getPortalHeader();
  if (headers) {
    setHeader(CUSTOM_HEADERS.ZNODE_LOCALE_ID, String(headers.localeId));
    setHeader(HEADERS.ACCEPT, CUSTOM_HEADERS.TEXT_PLAIN);
    setHeader(CUSTOM_HEADERS.DOMAIN_NAME, headers.hostName);
    setHeader(CUSTOM_HEADERS.LOCALE_CODE, headers.localeCode);
    setHeader(CUSTOM_HEADERS.PORTAL_CODE, headers.storeCode);
    if (headers.publishState) {
      setHeader(CUSTOM_HEADERS.PUBLISH_CODE, String(headers.publishState));
    }
  }

  if (isModifyRequest) {
    setHeader(CUSTOM_HEADERS.CONTENT_TYPE, CUSTOM_HEADERS.APPLICATION_JSON);
  }

  setHeader(CUSTOM_HEADERS.ACCEPT, CUSTOM_HEADERS.TEXT_PLAIN);
  setHeader(CUSTOM_HEADERS.CACHE_CONTROL, CUSTOM_HEADERS.NO_STORE);
  setHeader(CUSTOM_HEADERS.ZNODE_PRIVATE_KEY, String(process.env.PaymentAPI_PrivateKey ?? ""));
  setHeader(CUSTOM_HEADERS.AUTHORIZATION, "basic " + generateDomainBasedToken());

  if (isUserIdRequired && user?.userId) {
    setHeader(CUSTOM_HEADERS.ZNODE_USER_ID, user.userId?.toString());
  }

   if(user?.userId )
    requestHeaders.set(HEADERS.ZNODE_ACCOUNT_ID, user?.accountId?.toString()|| "");

  if (Number(profileId) > 0) {
    setHeader(CUSTOM_HEADERS.ZNODE_PROFILE_ID, String(profileId));
  }

  return requestHeaders;
}

export function extractCacheTags(cacheIndex: number, filter: IFilterTuple[]): string[] {
  const cacheTags = filter[cacheIndex]?.filterValue?.split(",") ?? [];
  // remove the cacheTags filter.
  filter.splice(cacheIndex, 1);
  return cacheTags;
}

export function addCacheOption(filter: IFilterTuple[], options?: RequestInit): RequestInit {
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
