/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterTuple } from "@znode/clients/v1";
import { Searches_seoUrlsBySeoUrl } from "@znode/clients/v2";
import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { logServer, AREA, errorStack } from "@znode/logger/server";
import { ISeoDetails } from "@znode/types/seo";
import { FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";

export async function getSeoData(slug: string, storeCode: string, localeCode: string, catalogCode: string): Promise<ISeoDetails> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, storeCode || "", "SeoUrlsBySeoUrl"));
    let seoData: any = await Searches_seoUrlsBySeoUrl(slug, storeCode, localeCode, catalogCode, cacheInvalidator.filterTupleArray as FilterTuple[]);

    seoData = {
      name: seoData.Name,
      seoId: seoData.SEOId,
      seoCode: seoData.SeoCode
    };
    return seoData;
  } catch (error) {
    logServer.error(AREA.SEO_URL_ROUTE, errorStack(error));
    return {} as ISeoDetails;
  }
}
