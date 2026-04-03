"use server";

import { cookies, headers } from "next/headers";

import { APP_NAME } from "@znode/constants/app";
import { IPortalDetail } from "@znode/types/portal";
import { ZnodePublishStatesEnum } from "@znode/types/enums";
import { getPortalDataFromGlobalCache } from "../../server";

export const getGlobalCacheKey = async (request?: Request) => {
  const appName = process.env.APP_NAME;
  if (appName == APP_NAME.PAGE_BUILDER) {
    const storeCode = headers().get("storeCode");
    return storeCode;
  } else {
    const currentHostName = request ? request.headers.get("host") : headers().get("host");
    return currentHostName;
  }
};

const localesList = new Map([
  ["en-US", 1],
  ["fr-FR", 2],
  ["de-DE", 3],
  ["es-ES", 4],
  ["be-BE", 5],
]);

export const getLocaleID = async (code: string) => {
  return localesList.get(code);
};

export const getPortalHeader = async (request?: Request, type?: string) => {
  const domainOrStoreCode = await getGlobalCacheKey(request);
  const globalMap = await getPortalDataFromGlobalCache(String(domainOrStoreCode), type);
  const cachedPortalDetails = JSON.parse(JSON.stringify(globalMap));
  if (type && type !== "") {
    return cachedPortalDetails;
  }
  const enumValue = ZnodePublishStatesEnum[cachedPortalDetails?.publishState as keyof typeof ZnodePublishStatesEnum];
  const locale = cookies().get("NEXT_LOCALE")?.value || "en-US";
  const localeId = (await getLocaleID(locale)) || cachedPortalDetails?.localeId;
  const portalHeaderData: IPortalDetail = {
    portalId: cachedPortalDetails?.portalId,
    localeId: localeId,
    publishState: enumValue,
    publishCatalogId: Number(cachedPortalDetails?.publishCatalogId),
    localeCode: locale,
    publishCatalogCode: cachedPortalDetails?.publishCatalogCode,
    storeCode: cachedPortalDetails?.storeCode,
    themeName: cachedPortalDetails?.themeName,
    hostName: cachedPortalDetails?.hostname || String(domainOrStoreCode),
    loginRequired: cachedPortalDetails?.loginRequired,
    userActivityEnabled: cachedPortalDetails?.userActivityEnabled,
  };
  return portalHeaderData;
};
