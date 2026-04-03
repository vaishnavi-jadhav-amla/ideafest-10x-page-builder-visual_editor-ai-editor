"use server";

import { extractDynamicValue, replaceDynamicSegment } from "./common";
import { getContent, setContent } from "./cache";

import type { Data } from "@measured/puck";
import { ErrorCodes } from "@znode/types/enums";
import { clearDataInGlobalCache, getPortalHeader } from "@znode/utils/server";
import { redirect } from "next/navigation";
import { validateContentByProfile } from "@znode/agents/content-page";
import { INullablePageStructure, IPageStructure } from "@znode/types/visual-editor";
import { APP_NAME } from "@znode/constants/app";
import { getLocalPageStructure } from "./page-structure/get-local-page-structure";
import { IPageVariant } from "../types/page-builder";
import { getServerPageStructure } from "./page-structure/get-server-page-structure";
import { CURRENT_JSON_VERSION, PAGE_CONSTANTS } from "@znode/page-builder/constants";
import { processHeaderFooterAndMainContentData } from "./process-header-footer-and-content-data";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { subscribeToChannel } from "@znode/cache";
import { portalDataCache, portalPromiseMap } from "@znode/agents/portal/global";
import { preparePageData } from "./prepare-page-details";
import { IPortalDetail } from "@znode/types/portal";
import { MigrationPipeline } from "../lib/migrations/MigrationPipeline";

const slashRegex = /\//g;
let isSubscribed = false;

interface IGetPageParam {
  url: string;
  pageCode?: string;
  storeCode?: string;
  contentPageCode?: string;
  publishState?: string;
  searchParams?: any;
  isDebug?: boolean;
  theme: string;
  contentPageId?: number | undefined;
  pageVariant?: IPageVariant;
  versionNumber?: number;
}

const emptyData: Data = {
  content: [],
  root: {},
};

const defaultPageStructure: IPageStructure = {
  key: "",
  data: emptyData,
};

const targetVersion = CURRENT_JSON_VERSION;

export async function getPage({
  url,
  pageCode,
  storeCode,
  contentPageCode,
  publishState,
  searchParams,
  contentPageId,
  pageVariant,
  versionNumber,
}: IGetPageParam): Promise<IPageStructure> {
  let pageStructure: INullablePageStructure = null;
  let urlWithPlaceholder = replaceDynamicSegment(url); // ** Note: Replace the numeric portion of the URL in params.url with a placeholder "{}"
  let id: string | null = extractDynamicValue(url);
  const publicId = urlWithPlaceholder.replace(slashRegex, "_"); // ** Note: Replace slash with underscore
  const isDynamic = Object.keys(searchParams || {}).length !== 0;

  try {
    const details = await getPortalHeader();
    storeCode = storeCode || details.storeCode;
    publishState = String(publishState || details.publishState)?.toLowerCase();
    const appName = process.env.APP_NAME;
    let hasDefaultPageStructure = false;

    if (contentPageCode && appName === APP_NAME.WEBSTORE) {
      const contentData = await validateContentByProfile(contentPageCode, details);
      if (contentData === false) hasDefaultPageStructure = true;
    }

    if (!pageCode) {
      pageCode = urlWithPlaceholder.split("/")[0];
    }

    const pageDetails = {
      id,
      isDynamic,
      details,
      pageCode,
      contentPageCode,
      searchParams,
    };

    const preparedDataCache: IPageStructure = await getContent(details, id, pageCode, isDynamic, searchParams, contentPageCode);
    if (preparedDataCache) {
      pageStructure = await preparePageData(preparedDataCache);
      // Json is upto date with latest configuration
      if (targetVersion == pageStructure?.pageVersion) {
        return pageStructure;
      }
    }

    if (process.env.IS_DEBUGGING === "true") {
      pageStructure = await getLocalPageStructure(
        String(details.storeCode),
        publicId,
        pageVariant || (PAGE_CONSTANTS.GENERAL.MAIN_CONTENT as IPageVariant),
        hasDefaultPageStructure
      );
    } else {
      pageStructure = await getServerPageStructure(
        pageCode ?? "",
        contentPageCode ?? "",
        storeCode ?? "",
        publishState,
        publicId,
        pageVariant ?? (PAGE_CONSTANTS.GENERAL.MAIN_CONTENT as IPageVariant),
        hasDefaultPageStructure,
        versionNumber
      );
    }

    if (pageStructure === null) {
      logServer.error(
        AREA.PAGE_BUILDER,
        `error in default page with pageCode = ${pageCode}, contentPageId = ${contentPageId}, contentPageCode = ${contentPageCode}, publishState = ${storeCode}, searchParams = ${searchParams}, pageVariant = ${pageVariant}, storeCode = ${storeCode}`
      );
      return defaultPageStructure;
    }

    const { footerData, headerData, mainData } = await processHeaderFooterAndMainContentData(
      {
        pageStructure: pageStructure,
        id: id,
        contentPageId: contentPageId,
        searchParams: searchParams,
      },
      isDynamic
    );

    const finalPageStructure = { data: mainData || emptyData, key: pageStructure?.key || "", headerData, footerData, pageVersion: pageStructure?.data?.pageVersion };

    console.log("serving fresh from API");
    if (finalPageStructure) await setContent(details, finalPageStructure, id, pageCode, isDynamic, searchParams, contentPageCode);
    pageStructure = await preparePageData(finalPageStructure);
    return await getMigratedJson(pageStructure, pageVariant, pageDetails, false);
  } catch (error: any) {
    if (error.message === ErrorCodes.InvalidStoreCode) {
      logServer.error(AREA.PAGE_BUILDER, `error in method get-page with store code ${storeCode}`);
      redirect("/error");
    } else if (error.message === ErrorCodes.MigrationFailed) {
      return { ...pageStructure, isMigrationFailed: true } as IPageStructure;
    } else {
      logServer.error(
        AREA.PAGE_BUILDER,
        `error in method get-page with params url ${url},pageCode = ${pageCode}, contentPageId = ${contentPageId}, contentPageCode = ${contentPageCode}, publishState = ${storeCode}, searchParams = ${searchParams}, pageVariant = ${pageVariant}, storeCode = ${storeCode} and error -> ${errorStack(
          error
        )}`
      );
    }
    return defaultPageStructure;
  }
}

export const initSubscription = async () => {
  if (isSubscribed) return;
  console.log("[Redis] FROM LAYOUT");
  isSubscribed = true;
  await subscribeToChannel<string[]>("cache-eviction", (keys: any) => {
    clearDataInGlobalCache();
    for (const key of keys) {
      getPortalHeader();
      console.log(JSON.stringify(keys));
      portalDataCache.delete(key);
      portalPromiseMap.delete(key);
      console.log(`[Eviction] Removing key: ${key}`);p
      isSubscribed = false;
    }
  });
};
export type { IPageVariant };

interface IPageDetails {
  details: IPortalDetail;
  id: string | null;
  pageCode: string | undefined;
  isDynamic: boolean;
  contentPageCode: string | undefined;
  searchParams: any;
}

async function getMigratedJson(pageStructure: IPageStructure, pageVariant: string | undefined, pageDetails: IPageDetails, isFromCache: boolean) {
  try {
    // if (pageVariant === "Layout") return pageStructure;
    let migratedJson = null;
    const { details, id, isDynamic, pageCode, contentPageCode, searchParams } = pageDetails;
    const sourceVersion = Number(pageStructure?.pageVersion || 1);
    // deleting pageVersion which was mapped inside data(i.e during live call) after assignment of sourceVersion.
    delete pageStructure?.data?.pageVersion;
    if (pageStructure && typeof targetVersion === "number" && sourceVersion !== targetVersion) {
      const pageJson = { ...pageStructure, version: sourceVersion };
      migratedJson = MigrationPipeline.migrateToLatest(structuredClone(pageJson), targetVersion);
      const finalMigratedJson = {
        ...pageStructure,
        data: migratedJson?.data,
        headerData: migratedJson.headerData,
        footerData: migratedJson.footerData,
        pageVersion: migratedJson.version,
      };
      // saving migrated data to cache with updated json and version.
      if (finalMigratedJson) {
        await setContent(details, finalMigratedJson, id, pageCode, isDynamic, searchParams, contentPageCode);
      }
      return finalMigratedJson;
    }

    return pageStructure;
  } catch (err) {
    console.error("Error in migrating page json. ", err);
    logServer.error(AREA.PAGE_JSON_MIGRATION, `Error in migrating page json. Error: ${errorStack(err)}`);
    if (process.env.APP_NAME === APP_NAME.PAGE_BUILDER) throw Error(ErrorCodes.MigrationFailed);
    else return pageStructure;
  }
}
