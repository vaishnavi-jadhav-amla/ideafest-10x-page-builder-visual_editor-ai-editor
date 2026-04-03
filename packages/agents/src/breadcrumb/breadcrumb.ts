import { ExpandCollection, ExpandKeys, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, generateTagName, getPortalHeader } from "@znode/utils/server";
import { FilterTuple, PublishCategories_idByCategoryId } from "@znode/clients/v2";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { IFilterTuple } from "@znode/types/filter";
import { IPublishCategory } from "@znode/types/category";
import { IUser } from "@znode/types/user";
import { getCatalogCode } from "../category";
import { getPortalDetails } from "../portal";
import { getSavedUserSession } from "@znode/utils/common";

export async function getBreadCrumbs(categoryId: number, isParentCategory: boolean): Promise<{ breadCrumb: string; breadCrumbPDP: string }> {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.SEO);
  const portalData = await getPortalHeader();
  const portalDetails = await getPortalDetails();
  const filters: IFilterTuple[] = getBreadCrumbFilters(FilterKeys.ActiveTrueValue);
  const userData = await getSavedUserSession();
  const catalogCode = await getCatalogCode(portalDetails, userData as IUser);
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.CATEGORY}, ${CACHE_KEYS.DYNAMIC_TAG}`, catalogCode || "", String(categoryId), "IdByCategoryId"));
  if (!portalData?.storeCode) {
    return { breadCrumb: "", breadCrumbPDP: "" };
  }
  const category = await PublishCategories_idByCategoryId(
    categoryId,
    catalogCode || "",
    String(portalData.storeCode),
    portalData.localeCode,
    expands,
    filters as FilterTuple[],
    undefined,
    cacheInvalidator.filterTupleArray as FilterTuple[]
  );
  const categoryResponse = convertCamelCase(category) as IPublishCategory;
  if (isParentCategory) {
    return { breadCrumb: await getBreadCrumbHtml(categoryResponse) as string, breadCrumbPDP: "" };
  } else {
    return (await getBreadCrumbHtmlForPLP(categoryResponse, isParentCategory)) as { breadCrumb: string; breadCrumbPDP: string };
  }
}

export async function getBreadCrumbHtml(categoryResponse: IPublishCategory | undefined) {
  if (categoryResponse) {
    const breadCrumb = `<a href='/${categoryResponse?.seoDetails?.seoUrl ? categoryResponse.seoDetails?.seoUrl : "category/" + categoryResponse.publishCategoryId}'>${
      categoryResponse.name || ""
    }</a>`;
    return breadCrumb;
  }
}

export async function getBreadCrumbHtmlForPLP(categoryResponse: IPublishCategory | undefined, isParentCategory: boolean) {
  if (categoryResponse) {
    let breadCrumb = isParentCategory
      ? `<a href='/${categoryResponse?.seoDetails?.seoUrl ? categoryResponse.seoDetails?.seoUrl : "category/" + categoryResponse.publishCategoryId}'>${categoryResponse.name}</a>`
      : categoryResponse.name;
      let breadCrumbPDP = categoryResponse.name? `<a href='/${
        categoryResponse?.seoDetails?.seoUrl ? categoryResponse.seoDetails?.seoUrl : "category/" + categoryResponse.publishCategoryId
      }'>${categoryResponse.name}</a>`: ""; 
    if (categoryResponse?.parentCategory && categoryResponse?.parentCategory?.length > 0 && isParentCategory)
      breadCrumb = (await getBreadCrumbHtml(categoryResponse?.parentCategory?.at(0))) + " / " + breadCrumb;
      breadCrumbPDP = (await getBreadCrumbHtml(categoryResponse?.parentCategory?.at(0))) + " / " + breadCrumbPDP;
    return { breadCrumb, breadCrumbPDP };
  }
}

export function getBreadCrumbFilters(isGetParentCategory?: string) {
  const filters: FilterCollection = new FilterCollection();
  if (isGetParentCategory) filters.add(FilterKeys.IsGetParentCategory, FilterOperators.Equals, isGetParentCategory);
  return filters.filterTupleArray;
}
