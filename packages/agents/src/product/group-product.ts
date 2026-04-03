import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase } from "@znode/utils/server";

import { IFilterTuple } from "@znode/types/filter";
import { IPortalDetail } from "@znode/types/portal";
import { PublishProduct_getGroupProducts } from "@znode/clients/v1";
import { getUserCatalogId } from "../user";
import { IUser } from "@znode/types/user";
import { getSavedUserSession } from "@znode/utils/common";
import { COMMON } from "@znode/constants/common";

/**
 * Get group product list.
 * @returns associated group product.
 */
export async function getGroupProductList(id: number, portalData: IPortalDetail) {
  const { publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues } = portalData;
  const userData = await getSavedUserSession();
  const catalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData as IUser);
  try {
    const filters: IFilterTuple[] = getGroupProductFilters(portalData.portalId, portalData.localeId, catalogId || 0, id);
    const sort = { DisplayOrder: COMMON.ASC };
    const associatedGroupProduct = await PublishProduct_getGroupProducts(undefined, filters, sort, undefined, undefined);
    return convertCamelCase(associatedGroupProduct.GroupProducts) || null;
  } catch (error) {
    logServer.error(AREA.PRODUCT, `The error occurred in the getGroupProductList() method with parameters id:${id}, portalId:${portalData.portalId}, localeId:${portalData.localeId} in group-product.ts file. ${errorStack(error)}`);
    return null;
  }
}

/**
 * Get filters for group product.
 * @param portalId
 * @param localeId
 * @param catalogId
 * @returns filters.
 */
function getGroupProductFilters(
  portalId: number,
  localeId: number,
  catalogId: number,
  productId: number,
  IsActive?: string,
  isGetAllLocationsInventory?: string,
  isGetParentCategory?: string
) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.PublishCatalogId, FilterOperators.Equals, String(catalogId));
  if (localeId > 0) filters.add(FilterKeys.LocaleId, FilterOperators.Equals, String(localeId));
  if (productId) filters.add(FilterKeys.ZnodeProductId, FilterOperators.Equals, String(productId));
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, String(portalId));
  if (IsActive !== undefined) filters.add(FilterKeys.IsActive, FilterOperators.Equals, IsActive);
  if (isGetAllLocationsInventory) filters.add(FilterKeys.IsGetAllLocationsInventory, FilterOperators.Equals, isGetAllLocationsInventory);
  if (isGetParentCategory) filters.add(FilterKeys.IsGetParentCategory, FilterOperators.Equals, isGetParentCategory);
  return filters.filterTupleArray;
}
