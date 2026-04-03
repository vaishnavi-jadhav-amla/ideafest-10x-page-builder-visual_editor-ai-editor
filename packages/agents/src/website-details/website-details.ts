import { FilterTuple, WebSite_logoDetailsByStoreCode } from "@znode/clients/v2";
import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";

/**
 * Fetches the dynamic theme CSS for a given portal.
 * @param portalId - The ID of the portal for which to fetch the theme.
 * @returns A promise that resolves to the dynamic CSS style or default theme colors.
 */

export const THEME_COLORS = `:root {
  --primary: rgb(0, 0, 0);
  --secondary: rgb(255, 255, 255);
  --primary-btn-bg: rgb(0, 0, 0);
  --secondary-btn-bg: rgb(255, 255, 255);
  --primary-btn-text: rgb(255, 255, 255);
  --secondary-btn-text: rgb(0, 0, 0);
  --btn-border: rgb(0, 0, 0);
  --btn-border-radius: 0.25rem;
  --header-bg: rgb(255, 255, 255);
  --footer-bg: rgb(0, 0, 0);
  --footer-primary-text: rgb(255, 255, 255);
  --footer-secondary-text: rgb(255, 255, 255);
  --navigation-bar-bg: rgb(243, 244, 246);
  --navigation-text: rgb(96, 84, 88);
  --link: rgb(30, 64, 175);
  --hover: rgb(59, 130, 246);
  --success: rgb(34, 197, 94);
  --error: rgb(194, 52, 41);
  --border-color: rgb(156, 163, 175);
  --breadcrumbs-text: rgb(74, 74, 74);
  --card-radius: 0.25rem;
  --card-border: rgb(226, 232, 240);
  --input-radius: 0.25rem;
  --input-border: rgb(211, 211, 211);
  --separator: rgb(156, 163, 175);
  --accent: rgb(0, 0, 0);
  --widget-edit-bar: rgb(93, 176, 67);
  --mega-menu-bg: rgb(241, 241, 241);
  --ticker-bg: rgb(0, 0, 0);
  --mega-menu-link: rgb(68, 64, 60);
  --loader-color: rgb(0, 0, 0);
  --impersonation-bar-bg: rgb(0, 0, 0);
   --widget-color:rgb(78, 73, 73);
  --focus-outline-color: rgb(0, 0, 0);
  --focus-outline-width: 2px;
  --focus-outline-radius: 4px;
  }`;

export async function getStoreCSS(storeCode: string): Promise<string> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, storeCode || "", "LogoDetailsByStoreCode")
    );
    const webSiteLogo = await WebSite_logoDetailsByStoreCode(storeCode, cacheInvalidator.filterTupleArray as FilterTuple[]);
    const dynamicCss = webSiteLogo?.DynamicContent?.DynamicCssStyle ?? THEME_COLORS;
    return dynamicCss;
  } catch (error) {
    logServer.error(AREA.WEBSITE, errorStack(error));
    return THEME_COLORS;
  }
}
