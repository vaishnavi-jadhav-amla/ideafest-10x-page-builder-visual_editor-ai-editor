import { IProductPortalData } from "@znode/types/product";
import { IUser } from "@znode/types/user";
import { FilterTuple } from "@znode/clients/v1";
import { convertPascalCase } from "@znode/utils/server";
import { getUserCatalogId } from "../user";
import { getProductListFilters } from "./product";

// Fetch and prepare product filters
export const getProductFilters = async (portalData: IProductPortalData, productId: number, userData: IUser) => {
  const { portalId, publishCatalogId, localeId, profileId, portalProfileCatalogId, portalFeatureValues } = portalData;
  const catalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData);
  const filters: FilterTuple[] = await getProductListFilters(portalId, localeId ?? 0, catalogId ?? 0, undefined, userData, undefined, undefined, undefined);
  return convertPascalCase(filters);
};
