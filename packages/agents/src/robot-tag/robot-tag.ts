import { AREA, errorStack, logServer } from "@znode/logger/server";

import { SEO_TYPES } from "@znode/constants/seo-types";
import { SEOs_seoDetail } from "packages/clients/src/znode-client/V2/seo-details";
import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators, generateTagName, getPortalHeader } from "@znode/utils/server";
import { isEmpty } from "@znode/utils/common";
import { headers } from "next/headers";
import { getPortalDetails } from "../portal";
import { getCatalogCode } from "../category";
import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { FilterTuple } from "@znode/clients/v2";

export async function getSeoData(slug?: string, id?: number, seoType?: string) {
  try {
    const portalData = await getPortalDetails();
    const headerList = headers();
    const host = headerList.get("host");
    const protocol = headerList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    const catalogCode = await getCatalogCode(portalData);
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${seoType},${CACHE_KEYS.DYNAMIC_TAG}`, portalData.storeCode || "", slug ?? String(id), "SeoDetail")
    );
    const seoDetails = await SEOs_seoDetail(
      portalData.localeCode || "",
      portalData.storeCode || " ",
      seoType || "",
      id || 0,
      slug || "",
      catalogCode,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const seoData = convertCamelCase(seoDetails);
    if (!seoData?.hasError && !isEmpty(seoData)) {
      const { seoDescription = "", seoKeywords = "", robotTag = "", seoTitle = "", canonicalUrl, seoUrl } = seoData || {};
      const metaTitle = seoTitle || portalData.websiteTitle;
      const url = `${baseUrl}/${canonicalUrl || seoUrl || (seoType && id ? `${seoType.toLowerCase()}/${id}` : "")}`;

      let robots;
      if (robotTag && robotTag !== SEO_TYPES.NONE) {
        robots = robotTag;
        return {
          robots,
          keywords: seoKeywords,
          description: seoDescription,
          title: metaTitle,
          alternates: {
            canonical: url,
          },
        };
      } else {
        const metaData = await getPortalHeader(undefined, "metaData");
        robots = metaData?.defaultRobotTag as string;
        return {
          robots,
          keywords: seoKeywords,
          description: seoDescription,
          title: metaTitle,
          alternates: {
            canonical: url,
          },
        };
      }
    }
    return null;
  } catch (error) {
    logServer.error(AREA.SEO_URL_ROUTE, errorStack(error));
    return {
      seoData: null,
    };
  }
}
