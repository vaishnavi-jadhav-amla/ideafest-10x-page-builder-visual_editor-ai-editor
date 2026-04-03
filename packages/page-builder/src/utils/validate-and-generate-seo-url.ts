import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators, generateTagName, getPortalHeader } from "@znode/utils/server";

import { ISeoDetails } from "@znode/types/seo";
import { SEO_TYPES } from "@znode/constants/seo-types";
import { FilterTuple, SEOs_seoDetail } from "@znode/clients/v2";
import { getCatalogCode } from "@znode/agents/category";
import { getPortalDetails } from "@znode/agents/portal";
import { getSeoData } from "@znode/agents/seo-url";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

const excludedUrls = ["home", "category/", "product/", "brand/", "blog/", "store-locator", "content/", "contactus", "feedback", "footer", "header", "cart", "checkout"];

export async function validateAndGenerateSeoUrl(url: string): Promise<ISeoDetails | null> {
  const portalHeader = await getPortalHeader();
  const portalData = await getPortalDetails();

  const slashIndex = url.indexOf("/");
  let id: number | undefined;

  if (slashIndex !== -1) {
    id = Number(url.substring(slashIndex + 1));
  }

  if (url.startsWith("content") && id !== undefined) {
    const catalogCode = await getCatalogCode(portalData);
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}}`, portalHeader.storeCode || "", "SeoDetails")
    );
    const seoDetails = await SEOs_seoDetail(
      portalData.cultureCode || "",
      portalData.storeCode || " ",
      SEO_TYPES.CONTENT_PAGE || "",
      id,
      "",
      catalogCode, cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const seoData = convertCamelCase(seoDetails);
    seoData.name = seoData.seoTypeName;
    seoData.seoId = id;
    return seoData;
  }

  // Check if URL requires SEO processing
  if (excludedUrls.some((prefix) => url.startsWith(prefix))) {
    return null; // No SEO call needed
  }
  const decodedUrl = decodeURIComponent(url);
  const storeCode = portalData.storeCode || "";
  const localeCode = portalHeader.localeCode || "";
  const catalogCode = await getCatalogCode(portalData);
  if (!decodedUrl || !storeCode || !localeCode || !catalogCode) return null;

  const seoData = await getSeoData(decodedUrl, storeCode, localeCode, catalogCode);
  const seoTypeName = String(seoData.name).toLowerCase();
  const seoId = seoData.seoId;

  return seoData;
}
