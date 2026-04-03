import { APP, APP_NAME, GLOBAL_SETTING_CODES } from "@znode/constants/app";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IPortalDetail, IPortalLocale } from "@znode/types/portal";

import { HEADERS } from "@znode/constants/headers";
import { convertCamelCase } from "../convert-case";
import { generateDomainBasedToken } from "../authentication/domain-authentication";
import { REQUIRED_PORTAL_KEYS, AVAILABLE_THEME_NAME, REQUIRED_DOMAIN_KEYS, DEFAULT_THEME_COLORS } from "./utils";
import { stringToBooleanV2 } from "../../../src/common/string-to-boolean";

let globalPortalCache = new Map();
export async function getSpecificData(domainNameOrStoreCode: string, type?: string) {
  switch (type) {
    case "metaData": {
      let metaData = getDataFromGlobalCache(`MetaData_${domainNameOrStoreCode}`);
      if (!metaData) {
        metaData = await getCurrentPortal(domainNameOrStoreCode);
        return metaData;
      }
      return metaData;
    }

    case "themeData": {
      let themeData = getDataFromGlobalCache(`Theme_${domainNameOrStoreCode}`);
      if (!themeData) {
        themeData = await getCurrentPortal(domainNameOrStoreCode);
        return themeData;
      }
      return themeData;
    }

    default: {
      let portalDataStore = getDataFromGlobalCache(`Portal_${domainNameOrStoreCode}`);
      if (!portalDataStore) {
        portalDataStore = await getCurrentPortal(domainNameOrStoreCode);
      }
      if (portalDataStore && portalDataStore.hasError) {
        return portalDataStore;
      }
      return portalDataStore;
    }
  }
}

export async function getPortalDataFromGlobalCache(domainNameOrStoreCode: string, type?: string) {
  return await getSpecificData(domainNameOrStoreCode, type);
}

export function checkRedirectUrl(urlRedirectionData: any[], url: string) {
  if (urlRedirectionData && urlRedirectionData.length > 0) {
    const isRedirectionAllowed = urlRedirectionData.find((path: { redirectTo: string; redirectFrom: string }) => `/${path.redirectFrom}` === url);
    url = isRedirectionAllowed?.redirectTo || "";
    if (url && url !== "") {
      return url;
    } else {
      return null;
    }
  } else return null;
}

export async function mapRedirectUrlProperties(redirectionUrlList: any[]) {
  if (redirectionUrlList && redirectionUrlList.length === 0) {
    return [];
  }
  return redirectionUrlList.map(({ RedirectFrom, RedirectTo }: any) => {
    return {
      redirectFrom: RedirectFrom,
      redirectTo: RedirectTo,
    };
  });
}

export async function getRedirectionDataFromGlobalCache(portalId: number, pathname: string, domainNameOrStoreCode: string) {
  let redirectionUrlStore = getDataFromGlobalCache(`RedirectionUrl_${domainNameOrStoreCode}`);
  if (!redirectionUrlStore) {
    try {
      const redirectionUrlFormattedResponse = await fetch301RedirectionUrl(portalId, domainNameOrStoreCode);

      if (redirectionUrlFormattedResponse) {
        redirectionUrlStore = await mapRedirectUrlProperties(redirectionUrlFormattedResponse.UrlRedirectList ?? []);
        redirectionUrlStore && setDataInGlobalCache(`RedirectionUrl_${domainNameOrStoreCode}`, redirectionUrlStore);
        return checkRedirectUrl(redirectionUrlStore, pathname) || fetchAllRedirectUrl(portalId, domainNameOrStoreCode, pathname);
      }
    } catch (error: any) {
      return null;
    }
  } else {
    return checkRedirectUrl(redirectionUrlStore, pathname) || fetchAllRedirectUrl(portalId, domainNameOrStoreCode, pathname);
  }
}

// fetching all the 301 redirect urls if total results exceed page Size limit
const fetchAllRedirectUrl = async (portalId: number, domainNameOrStoreCode: string, pathname: string) => {
  if (!pathname || pathname === "/" || pathname === "") return null;
  const paginationData = getDataFromGlobalCache(`Redirect_PaginationDetail_${domainNameOrStoreCode}`);
  if (paginationData?.TotalResults > paginationData?.PageSize) {
    const redirectionUrlFormattedResponse = await fetch301RedirectionUrl(portalId, domainNameOrStoreCode, paginationData?.TotalResults || 500);
    if (redirectionUrlFormattedResponse) {
      const redirectionUrlStore = await mapRedirectUrlProperties(redirectionUrlFormattedResponse.UrlRedirectList ?? []);
      redirectionUrlStore && setDataInGlobalCache(`RedirectionUrl_${domainNameOrStoreCode}`, redirectionUrlStore);
      return checkRedirectUrl(redirectionUrlStore, pathname);
    }
  }
  return null;
};

const fetch301RedirectionUrl = async (portalId: number, domainNameOrStoreCode: string, pageSize = 500) => {
  try {
    const apiUrl = `${APP.BASE_URL}v2/redirect-urls?pageSize=${pageSize}&pageIndex=1&sort=CMSUrlRedirectId~desc&filter=PortalId~eq~${portalId},isactive~eq~true`;
    const redirectionUrlResponse = await fetch(apiUrl, getRequestHeaders());
    const redirectionUrlFormattedResponse = await redirectionUrlResponse.json();
    if (!redirectionUrlFormattedResponse?.HasError) {
      const paginationData = redirectionUrlFormattedResponse?.PaginationDetail;
      if (paginationData) setDataInGlobalCache(`Redirect_PaginationDetail_${domainNameOrStoreCode}`, paginationData);
      return redirectionUrlFormattedResponse;
    }
  } catch (error) {
    return null;
  }
};
export function getDefaultLocale(portalLocals: IPortalLocale[]) {
  const formattedPortalLocaleResponse = convertCamelCase(portalLocals);
  const defaultPortalLocale = formattedPortalLocaleResponse.find((val: IPortalLocale) => val?.isDefault === true);
  return defaultPortalLocale?.code;
}

function setDataInGlobalCache(key: string, value: any | null) {
  key && value && globalPortalCache.set(key, value);
}

export function clearDataInGlobalCache() {
  globalPortalCache = new Map();
}

export function clearDataInGlobalCacheByKey(key: string) {
  key && globalPortalCache.delete(key);
}

export function checkThemeExist(name: string) {
  return AVAILABLE_THEME_NAME.includes(name);
}

function getDataFromGlobalCache(key: string) {
  return globalPortalCache.get(key);
}

function throwExceptions(response: { hasError: boolean; message: string | undefined }) {
  if (response && response.hasError) {
    throw Error(response.message);
  }
}

async function getDynamicCSS(storeCode: string) {
  try {
    const apiUrl = `${APP.BASE_URL}v2/websites/${storeCode}/logo-details`;
    const themeResponse = await fetch(apiUrl, getRequestHeaders());
    const formattedThemeResponse = await themeResponse.json();
    const themeData = formattedThemeResponse?.DynamicContent?.DynamicCssStyle;
    return themeData ? themeData : DEFAULT_THEME_COLORS;
  } catch (e) {
    return DEFAULT_THEME_COLORS;
  }
}

const getCurrentPortal = async (domainOrStoreCode: string) => {
  const portalAPIRequestInstance = globalPortalCache.get(`portalAPIRequestInstance_${domainOrStoreCode}`);
  if (portalAPIRequestInstance) {
    return portalAPIRequestInstance;
  }
  const portalDataPromise = (async () => {
    const appName = process.env.APP_NAME;
    try {
      const domainDetails = await getCurrentDomain(domainOrStoreCode, appName || "");
      if (appName === APP_NAME.WEBSTORE && domainDetails?.isDomainConfigured === false) {
        logServer.error(AREA.DOMAIN, "error occurred while fetching domain details");
        return domainDetails;
      }
      const isRequestFromPageBuilder = appName == APP_NAME.PAGE_BUILDER ? true : false;
      const hostName = !isRequestFromPageBuilder ? domainOrStoreCode : "";
      (process.env.NODE_ENV == "development" || appName == APP_NAME.PAGE_BUILDER) && throwExceptions(domainDetails);
      REQUIRED_DOMAIN_KEYS.forEach((key) => {
        if (domainDetails[key] === undefined) {
          logServer.error(AREA.LAUNCHING_ERROR, `Few issue found while retrieving domain list data ${key}`);
        }
      });

      if (!(domainDetails && domainDetails.StoreCode)) {
        logServer.error(AREA.LAUNCHING_ERROR, `error occurred while fetching domain details -> ${JSON.stringify(domainDetails)}`);
      }

      const apiUrl = `${APP.BASE_URL}v2.1/portals/${domainDetails.StoreCode}/application/${domainDetails.ApplicationType}`;
      const portalResponse = await fetch(apiUrl, getRequestPortalHeaders(hostName));
      if (portalResponse.status === 204) {
        logServer.error(AREA.PORTAL, "Portals details api not working on startup");
        return { isStorePublish: false };
      }
      const formattedPortalResponse = await portalResponse.json();
      const clonedResponse = JSON.stringify(formattedPortalResponse);
      const portalDetails = JSON.parse(clonedResponse);
      if ((!portalDetails || portalDetails.errorMessage) && process.env.NODE_ENV === "development") {
        const portalResponseBody = { responseData: null, hasError: true, message: "Portals details api not working on startup" };
        throwExceptions(portalResponseBody);
      }
      const portalData: IPortalDetail = {
        portalId: portalDetails.PortalId || 0,
        localeId: portalDetails.LocaleId || 0,
        publishState: portalDetails.PublishState,
        publishCatalogId: portalDetails.PublishCatalogId || 0,
        localeCode: getDefaultLocale(portalDetails.PortalLocales),
        publishCatalogCode: portalDetails.CatalogCode,
        storeCode: portalDetails.StoreCode,
        themeName: portalDetails.ThemeName,
        loginRequired: getLoginRequiredFlag(portalDetails),
        underMaintenance: getUnderMaintenance(portalDetails),
        globalUnderMaintenance: getGlobalUnderMaintenance(portalDetails),
        userActivityEnabled: false,
        isDomainActive: domainDetails?.IsActive,
      };
      const metaData = {
        websiteTitle: portalDetails?.WebsiteTitle,
        websiteDescription: portalDetails?.WebsiteDescription,
        mediaServerUrl: portalDetails?.MediaServerUrl,
        faviconImage: portalDetails?.FaviconImage,
        defaultRobotTag: portalDetails?.DefaultRobotTag,
      };
      if (appName == APP_NAME.PAGE_BUILDER) {
        portalData.hostname = domainDetails.DomainName;
      }
      REQUIRED_PORTAL_KEYS.forEach((key) => {
        if (portalDetails[key] === undefined) {
          logServer.error(AREA.LAUNCHING_ERROR, `Few issue found while retrieving portal data ${JSON.stringify(portalData)}`);
        }
      });
      try {
        portalData.userActivityEnabled = await getUserActivityLoggingFlag();
      } catch (err) {
        logServer.error(AREA.GENERAL_SETTING, `Failed fetching userActivityEnabled for portal ${domainOrStoreCode}: ${errorStack(err)}`);
      }
      const themeData = await getDynamicCSS(domainDetails.StoreCode);
      if (portalData && portalData.storeCode) {
        setDataInGlobalCache(`Portal_${domainOrStoreCode}`, portalData);
        setDataInGlobalCache(`MetaData_${domainOrStoreCode}`, metaData);
        setDataInGlobalCache(`Theme_${domainOrStoreCode}`, themeData);
        return portalData;
      } else throw new Error(`error in portal response ${JSON.stringify(portalData)}`);
    } catch (error: any) {
      logServer.error(AREA.LAUNCHING_ERROR, `The error occurred while retrieving current portal details for the domain Or StoreCode: ${domainOrStoreCode}. ${errorStack(error)}`);
      clearDataInGlobalCacheByKey(`portalAPIRequestInstance_${domainOrStoreCode}`);
      return error && error.message && (process.env.NODE_ENV == "development" || appName == APP_NAME.PAGE_BUILDER) ? { hasError: true, message: error.message } : null;
    }
  })();
  globalPortalCache.set(`portalAPIRequestInstance_${domainOrStoreCode}`, portalDataPromise);
  return portalDataPromise;
};

export const getLoginRequiredFlag = (currentPortal: any) => {
  let isLoginRequired = false;
  const loginRequiredAttribute = currentPortal?.GlobalAttributes?.Attributes?.find((x: any) => x.AttributeCode === "LoginRequired");
  if (loginRequiredAttribute) {
    isLoginRequired = loginRequiredAttribute?.AttributeValue === "true" ? true : false;
  }
  return isLoginRequired;
};

/**
 * Get domain list.
 * @returns domain list.
 */

const getErrorResponseBasedOnApp = async (isRequestFromPageBuilder: boolean) => {
  let message = process.env.NODE_ENV == "development" ? { responseData: null, hasError: true, message: "Domain details api not working on startup" } : null;
  if (isRequestFromPageBuilder) {
    message = { responseData: null, hasError: true, message: "Preview is not published" };
  }
  return message;
};

export const getCurrentDomain = async (domainURL: string, appName: string) => {
  debugger;
  //domainURL = "webstore-z10-qa.znodecorp.com";
  const isRequestFromPageBuilder = appName == APP_NAME.PAGE_BUILDER ? true : false;
  try {
    let filter = `?filter=domainname~eq~"${domainURL}"`;
    if (isRequestFromPageBuilder) {
      filter = `?pageIndex=1&pageSize=10&filter=StoreCode~eq~${domainURL},isactive~eq~true,isdefault~eq~true,ApplicationType~eq~"WebstorePreview"`;
    }
    const domainList = `${APP.BASE_URL}v2/domains${filter}`;
    const domainResponse = await fetch(domainList, getRequestHeaders());
    if (domainResponse.status === 204 && isRequestFromPageBuilder) {
      throw Error("Page builder preview is not published");
    }
    if (domainResponse.status === 204) {
      return { isDomainConfigured: false};
    }
    const formattedDomainResponse = await domainResponse.json();
    return formattedDomainResponse.Domains.at(0);
  } catch (error) {
    logServer.error(AREA.LAUNCHING_ERROR, `The error occurred while retrieving current domain details for the domainURL: ${domainURL}. ${errorStack(error)}`);
    return await getErrorResponseBasedOnApp(isRequestFromPageBuilder);
  }
};

const getRequestPortalHeaders = (hostName: string) => {
  const headers: HeadersInit = new Headers();
  headers.set(HEADERS.AUTHORIZATION, "basic " + generateDomainBasedToken());
  headers.set(HEADERS.DOMAIN_NAME, hostName || "");
  const reqHeaders: RequestInit = {
    headers: headers,
  };
  return reqHeaders;
};

const getRequestHeaders = () => {
  const headers: HeadersInit = new Headers();
  headers.set(HEADERS.AUTHORIZATION, "basic " + generateDomainBasedToken());
  const reqHeaders: RequestInit = {
    headers: headers,
  };
  return reqHeaders;
};

export async function getMaintenanceMode(groupCode: string, attributeCode: string) {
  try {
    const apiUrl = `${APP.BASE_URL}v2/global-settings/code/${groupCode}/${attributeCode}`;
    const response = await fetch(apiUrl, getRequestHeaders());
    const data = await response.json();
    return data;
  } catch (error) {
    logServer.error(AREA.LAUNCHING_ERROR, `Error fetching maintenance mode: ${errorStack(error)}`);
    return null;
  }
}

export const getUnderMaintenance = (currentPortal: any) => {
  let underMaintenance = false;
  const underMaintenanceAttribute = currentPortal?.GlobalAttributes?.Attributes?.find((x: any) => x.AttributeCode === "WebstoreUnderMaintenance");
  if (underMaintenanceAttribute) {
    underMaintenance = underMaintenanceAttribute?.AttributeValue === "true" ? true : false;
  }
  return underMaintenance;
};

export const getGlobalUnderMaintenance = (currentPortal: any) => {
  let globalUnderMaintenance = false;
  const globalUnderMaintenanceAttribute = currentPortal?.GlobalAttributes?.Attributes?.find((x: any) => x.AttributeCode === "EnableMaintenanceForAllStores");
  if (globalUnderMaintenanceAttribute) {
    globalUnderMaintenance = globalUnderMaintenanceAttribute?.AttributeValue === "true" ? true : false;
  }
  return globalUnderMaintenance;
};

async function getUserActivityLoggingFlag(): Promise<boolean> {
  try {
    const { GROUP_CODE, SETTING_CODE } = GLOBAL_SETTING_CODES.USER_ACTIVITY;
    const apiUrl = `${APP.BASE_URL}v2/global-settings/code/${GROUP_CODE}/${SETTING_CODE}`;

    const requestOptions = getRequestHeaders();
    (requestOptions.headers as Headers).set(HEADERS.ACCEPT, "application/json");

    const response = await fetch(apiUrl, { ...requestOptions, method: "GET" });
    if (!response.ok) throw new Error(`API failed with status ${response.status}`);

    let settingResponse = await response.json();

    if (typeof settingResponse === "string") {
      settingResponse = JSON.parse(settingResponse);
    }

    const attributeValue = settingResponse?.AttributeValue;
    if (attributeValue == null) {
      logServer.error(AREA.GENERAL_SETTING, "User activity setting missing AttributeValue. Defaulting to false.");
      return false;
    }
    return stringToBooleanV2(attributeValue);
  } catch (error) {
    logServer.error(AREA.GENERAL_SETTING, `Error fetching user activity logging flag: ${errorStack(error)}`);
    return false;
  }
}
