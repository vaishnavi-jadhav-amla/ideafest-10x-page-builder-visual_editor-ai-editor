import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators } from "@znode/utils/server";
import { NextRequest, NextResponse } from "next/server";
import { IUrlRedirectionResponse } from "@znode/types/url-redirect";
import { UrlRedirect_getUrlRedirectList } from "@znode/clients/v1";

export async function getUrlRedirectionFilteredData(urlRedirectionList: IUrlRedirectionResponse[], pathname: string, request: NextRequest) {
  if (urlRedirectionList && urlRedirectionList.length > 0)
    try {
      const redirectUrl = urlRedirectionList.find((path: { redirectTo: string; redirectFrom: string }) => `/${path.redirectFrom}` === pathname);
      if (redirectUrl && redirectUrl.isActive && pathname === `/${redirectUrl.redirectTo}`) {
        const url = request.nextUrl.clone();
        return NextResponse.redirect(url);
      } else {
        const urlRedirectionData = urlRedirectionList.find((path: { redirectFrom: string }) => pathname.includes(path.redirectFrom));
        return urlRedirectionData;
      }
    } catch (error) {
      logServer.error(AREA.URL_REDIRECTION, errorStack(error));
      return null;
    }
}

export async function getUrlRedirectionData(portalId: number) {
  try {
    let urlRedirectionList = [];
    const filters = new FilterCollection();
    filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());

    const response = await UrlRedirect_getUrlRedirectList(filters.filterTupleArray);

    if (!response?.HasError) {
      const urlRedirectionData = convertCamelCase(response);
      urlRedirectionList = urlRedirectionData.urlRedirectList ?? [];
    }
    return urlRedirectionList;
  } catch (err) {
    logServer.error(AREA.URL_REDIRECTION, errorStack(err));
    return [];
  }
}

export async function getUrlRedirectResponse(portalId: number, pathname: string, request: NextRequest) {
  const urlRedirectionData = await getURLRedirectionListFromGlobalCache(portalId, pathname, request);
  if (urlRedirectionData && typeof urlRedirectionData === "object" && Object.keys(urlRedirectionData).length > 0 && urlRedirectionData.isActive) {
    const url = request.nextUrl.clone();
    url.pathname = urlRedirectionData.redirectTo;
    const response = NextResponse.redirect(url);
    return response;
  } else return null;
}

async function getURLRedirectionListFromGlobalCache(portalId: number, pathname: string, request: NextRequest) {
  return (await getUrlRedirectionFilteredData(await getUrlRedirectionData(portalId), pathname, request)) as IUrlRedirectionResponse;
}
