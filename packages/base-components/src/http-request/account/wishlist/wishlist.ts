import { IWishListProduct, IWishlistResponse } from "@znode/types/account";
import { httpRequest } from "../../base";

export const getWishList = async (props: { sortValue: { [key: string]: string }; pageIndex: number | string; pageSize: number | string }) => {
  const { pageIndex, pageSize } = props;
  const getWishListResponse = await httpRequest<IWishlistResponse>({
    endpoint: "/api/account/wishlist",
    method: "GET",
    queryParams: { pageIndex, pageSize },
  });
  return getWishListResponse;
};

export const deleteWishList = async (sku: string) => {
  const deleteWishListResponse = await httpRequest({
    endpoint: "/api/account/wishlist/delete-wishlist",
    method: "DELETE",
    body: { sku },
  });
  return deleteWishListResponse;
};

export const createWishList = async (wishListData: { sku: string }) => {
  const createWishListResponse = await httpRequest<IWishListProduct>({ endpoint: "/api/account/wishlist/create-wishlist", body: wishListData });
  return createWishListResponse;
};

export const getWishListByProductSkus = async (skus: string) => {
  const getWishListResponse = await httpRequest<IWishListProduct[]>({
    endpoint: "/api/account/wishlist/get-wishlist-by-product-skus",
    method: "GET",
    queryParams: { skus },
  });
  return getWishListResponse;
};
