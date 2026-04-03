import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { clearDataInGlobalCache, getPortalDataFromGlobalCache } from "@znode/utils/server";
import { ErrorCodes } from "@znode/types/enums";

interface IPortalData {
  message: string;
  hasError?: boolean;
  portalId: number,
  localeId: number,
  publishState: number,
  publishCatalogId: number,
  localeCode: string,
  storeCode: string,
  themeName: string,
  publishCatalogCode: string,
};

const readStoreCodeFromParentUrl = (request: NextRequest) => {
  if (request.headers.get("referer")) {
    const decodedUrl = decodeURIComponent(String(request.headers.get("referer"))).replace(/^"|"$/g, "");
    const storeCode = new URLSearchParams(new URL(decodedUrl).search).get("storeCode");
    return storeCode;
  } else {
    return null;
  }
};

export const excludedPaths = ["/error", "/page-builder-error"];

export function validatePath(headerKey: string, headerValue: string, request: NextRequest, response: NextResponse) {
  const path = request.nextUrl.pathname;

  if (!path.includes("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/error";
    url.search = ""; 
    const response = NextResponse.redirect(url);
    response.headers.set(headerKey, headerValue);
    response.headers.set("x-redirect", "false");
    return response;
  } else {
    response.headers.set(headerKey, headerValue);
    response.headers.set("x-redirect", "false");
    return response;
  }
}

export async function checkForValidatePath(request: NextRequest, portalData: IPortalData, response: NextResponse) {
  if(portalData && portalData.hasError)
  {
    return validatePath("x-error-code", ErrorCodes.PreviewUrlNotPublished, request, response);
  }
   else {
    return response;
  }
}

export const setStoreCode = async (request: NextRequest, response: NextResponse) => {
  if (excludedPaths.includes(request.nextUrl.pathname)) {
    response.headers.set("x-redirect", "false");
    return response;
  }
  const storeCode = request.nextUrl.searchParams.get("storeCode") || readStoreCodeFromParentUrl(request);
  if(request.nextUrl.pathname.includes("revalidate")) {
    clearDataInGlobalCache();
  }
  if (storeCode) {
    const formattedStoreCode = (storeCode && storeCode.replace(/^"|"$/g, "")) || "";
    response.headers.set("StoreCode", formattedStoreCode);
    const portalResponse = await getPortalDataFromGlobalCache(String(formattedStoreCode));
    if (!request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.includes("check-global-cache")) {
      return await checkForValidatePath(request, portalResponse, response);
    } else {
      return response;
    }
  }
  return response;
};

export default async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api") && !excludedPaths.includes(request.nextUrl.pathname)) {
    const handleI18nRouting = createMiddleware(routing);
    const response = handleI18nRouting(request);
    return await setStoreCode(request, response);
  } else {
    const response: NextResponse = NextResponse.next();
    if (request.nextUrl.pathname.startsWith("/api/health-check")) {
      return response;
    }
    return await setStoreCode(request, response);
  }
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|images/books|icons|manifest).*)"],
};
