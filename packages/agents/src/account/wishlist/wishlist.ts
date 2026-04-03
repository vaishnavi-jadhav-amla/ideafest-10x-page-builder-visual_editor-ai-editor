import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ExpandCollection, ExpandKeys, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, getPortalHeader } from "@znode/utils/server";
import { FilterTuple, WishLists_skus, WishLists_wishList, WishLists_wishListsByUserName, WishLists_wishListsByWishListId } from "@znode/clients/v2";
import { ICreateWishlist, IWishListProduct, IWishlist } from "@znode/types/account";
import { getAttributeValue, getSavedUserSession } from "@znode/utils/common";

import { IFilterTuple } from "@znode/types/filter";
import { IUser } from "@znode/types/user";
import { PRODUCT } from "@znode/constants/product";
import { convertDate } from "@znode/utils/component";
import { getGeneralSettingList } from "../../general-setting";
import { getPortalDetails } from "../../portal";
import { getUserCatalogId } from "../../user";

export const getWishList = async (userName: string, pageIndex?: number, pageSize?: number, sortValue?: { [key: string]: string }) => {
  try {
    const expand = wishlistDataExpand();
    const { publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, localeId } = await getPortalDetails();
    const userData = await getSavedUserSession();
    const portalData = await getPortalDetails();
    const catalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData as IUser);

    const filter = filterForWishList(localeId, catalogId, portalData.portalId);
    const response = await WishLists_wishListsByUserName(userName, expand, filter as FilterTuple[], sortValue, pageIndex, pageSize);
    const wishList = convertCamelCase(response);
    
    if (!wishList) {
      return {
        wishList: [],
        pageIndex: 0,
        pageSize: 0,
        totalPages: 0,
        totalResults: 0,
        pageList: [],
      };
    }
    
    const generalSetting = await getGeneralSettingList();
    const { wishListProducts, wishList: wishlistData } = wishList;
    const wishListData = mapRelevantWishList(wishListProducts, wishlistData, generalSetting);
    const wishListResponse = {
      wishList: wishListData,
      pageIndex: wishList.paginationDetail.pageIndex,
      pageSize: wishList.paginationDetail.pageSize,
      totalPages: wishList.paginationDetail.totalPages,
      totalResults: wishList.paginationDetail.totalResults,
      pageList: portalData.pageList,
    };
    return wishListResponse;
  } catch (error) {
    logServer.error(AREA.WISH_LIST, errorStack(error));
    return {
      wishList: [],
      pageIndex: 0,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
      pageList: [],
    };
  }
};

const mapRelevantWishList = (productResponse: IWishlist[], wishlist: IWishListProduct[], generalSetting: { dateFormat: string; displayTimeZone: string }): IWishlist[] => {
  const { dateFormat, displayTimeZone } = generalSetting;
  const wishlistMap = new Map(wishlist.map((item) => [item.id, item.wishListAddedDate]));
  const wishListData =
    productResponse.length > 0 && productResponse.length > 0
      ? productResponse.map((product: IWishlist) => {
          const { quantity = 0, retailPrice, salesPrice, publishProductId, wishListId, attributes = [], seoUrl } = product;
          const isObsolete = (getAttributeValue(attributes, "IsObsolete", "attributeValues") || "") as string;
          const outOfStockOption = getAttributeValue(attributes, PRODUCT.OUT_OF_STOCK_OPTIONS) as string;
          const isOutOfStock = outOfStockOption === PRODUCT.DISABLE_PURCHASING && Math.floor(quantity) === 0;
          const createdDate = wishlistMap.get(product.wishListId);
          const wishListAddedDate = createdDate ? convertDate(createdDate, dateFormat, displayTimeZone) : "";
          const isCallForPricing = getAttributeValue(attributes, "CallForPricing", "attributeValues") === "true";
          const isAddonsRequired = (product.addOns || []).some((data) => data?.isRequired);
          const isPersonalizable = attributes.some((data) => data.isPersonalizable);
          return {
            ...product,
            retailPrice,
            salesPrice,
            publishProductId,
            price: salesPrice ?? retailPrice,
            userWishListId: wishListId as number,
            isObsolete,
            isOutOfStock,
            seoUrl,
            wishListAddedDate,
            isCallForPricing,
            isAddonsRequired,
            isPersonalizable,
          };
        })
      : [];

  return wishListData;
};

function wishlistDataExpand() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Product);
  expands.add(ExpandKeys.Pricing.toLocaleLowerCase());
  expands.add(ExpandKeys.WishlistAddons.toLowerCase());
  expands.add(ExpandKeys.SEO);
  return expands;
}

export const deleteWishList = async ({ userName, sku }: { userName: string; sku: string }): Promise<boolean> => {
  try {
    const response = await WishLists_wishListsByWishListId(userName, sku);
    return response.IsSuccess || false;
  } catch (error) {
    logServer.error(AREA.WISH_LIST, errorStack(error));
    return false;
  }
};

export const createWishList = async (wishlistRequest: ICreateWishlist) => {
  const portalData = await getPortalHeader();
  try {
    const wishListPayload = {
      UserName: wishlistRequest.userName,
      StoreCode: portalData.storeCode || "",
      SKU: wishlistRequest.sku,
    };
    const response = convertCamelCase(await WishLists_wishList(wishListPayload));
    return response;
  } catch (error) {
    logServer.error(AREA.WISH_LIST, errorStack(error));
    return null;
  }
};
/**
 * Get filters for user.
 * @param portalId
 * @param localeId
 * @param catalogId
 * @returns filters.
 */
export function filterForWishList(localeId?: number, znodeCatalogId?: number, portalId?: number): IFilterTuple[] {
  const filters: FilterCollection = new FilterCollection();

  if (localeId !== undefined && localeId > 0) filters.add(FilterKeys.LocaleId, FilterOperators.Equals, String(localeId));
  if (znodeCatalogId !== undefined && znodeCatalogId > 0) filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, String(znodeCatalogId));
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, String(portalId));
  return filters.filterTupleArray;
}

export const getWishListByProductSkus = async (userName: string, skus: string) => {
  const { storeCode } = await getPortalHeader();
  const wishlistData = await WishLists_skus(userName, skus, storeCode || "");
  return convertCamelCase(wishlistData.UserWishListResponse) || [];
};
