import { AREA, errorStack, logServer } from "@znode/logger/server";
import {
  VisualEditor_pagesGetByPageCode,
  VisualEditor_pagesPreviewByPageCode,
  VisualEditor_contentPagesGetByPageCode,
  VisualEditor_contentPagesPreviewByPageCode,
  FilterTuple,
} from "@znode/clients/v2";
import { INullablePageStructure } from "@znode/types/visual-editor";
import { FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export async function getPageByPageCode(pageCode: string, portalCode: string, profileCode: string): Promise<INullablePageStructure> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL},${CACHE_KEYS.DYNAMIC_TAG} `, portalCode || "", "PagesGetByPageCode")
    );
    const pageDetails = await VisualEditor_pagesGetByPageCode(pageCode, portalCode, profileCode, cacheInvalidator.filterTupleArray as FilterTuple[]);
    return JSON.parse(pageDetails.PageJson);
  } catch (error) {
    logServer.error(
      AREA.WEBSITE,
      `The error occurred in the getPageByPageCode() method with parameters pageCode:${pageCode}, portalCode:${portalCode}, profileCode:${profileCode} in visual-editor.ts file. ${errorStack(
        error
      )}`
    );
    return null;
  }
}

export async function getPreviewPageByPageCode(pageCode: string, portalCode: string, profileCode: string, versionNumber?: number): Promise<INullablePageStructure> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL},${CACHE_KEYS.DYNAMIC_TAG} `, portalCode || "", "PagesPreviewByPageCode")
    );
    const pageDetails = await VisualEditor_pagesPreviewByPageCode(pageCode, portalCode, profileCode, versionNumber, cacheInvalidator.filterTupleArray as FilterTuple[]);
    return JSON.parse(pageDetails.PageJson);
  } catch (error) {
    logServer.error(
      AREA.WEBSITE,
      `The error occurred in the getPreviewPageByPageCode() method with parameters pageCode:${pageCode}, portalCode:${portalCode}, profileCode:${profileCode} in visual-editor.ts file. ${errorStack(
        error
      )}`
    );
    return null;
  }
}

export async function getProductionContentPageByPageCode(pageCode: string, portalCode: string, profileCode: string): Promise<INullablePageStructure> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, portalCode || "", "ContentPagesGetByPageCode")
    );
    const pageDetails = await VisualEditor_contentPagesGetByPageCode(pageCode, portalCode, profileCode, cacheInvalidator.filterTupleArray as FilterTuple[]);
    return JSON.parse(pageDetails.PageJson || "{}");
  } catch (error) {
    logServer.error(
      AREA.WEBSITE,
      `The error occurred in the getProductionContentPageByPageCode() method with parameters pageCode:${pageCode}, portalCode:${portalCode}, profileCode:${profileCode} in visual-editor.ts file. ${errorStack(
        error
      )}`
    );
    return null;
  }
}

export async function getPreviewContentPageByPageCode(pageCode: string, portalCode: string, profileCode: string, versionNumber?: number): Promise<INullablePageStructure> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, portalCode || "", "ContentPagesPreviewByPageCode")
    );
    const pageDetails = await VisualEditor_contentPagesPreviewByPageCode(pageCode, portalCode, profileCode, versionNumber, cacheInvalidator.filterTupleArray as FilterTuple[]);
    return JSON.parse(pageDetails.PageJson);
  } catch (error) {
    logServer.error(
      AREA.WEBSITE,
      `The error occurred in the getPreviewContentPageByPageCode() method with parameters pageCode:${pageCode}, portalCode:${portalCode}, profileCode:${profileCode} in visual-editor.ts file. ${errorStack(
        error
      )}`
    );
    return null;
  }
}

