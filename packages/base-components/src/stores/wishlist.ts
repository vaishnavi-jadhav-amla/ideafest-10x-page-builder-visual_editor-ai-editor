// stores/wishlistStore.ts
import { create } from "zustand";
import { getWishListByProductSkus } from "../http-request/account/wishlist/wishlist";
import { logClient } from "@znode/logger";
import { IProductList } from "@znode/types/product";

type WishlistState = {
  wishListSkus: string[];
  fetchWishList: (_productList: { sku: string | IProductList [] }[]) => Promise<void>;
  updateWishListSkus: (_skus: string[], _action: "ADD" | "REMOVE" | "UPDATE") => void;
  isSkuInWishList: (_sku: string) => boolean;
};

export const useWishListStore = create<WishlistState>((set, get) => ({
    wishListSkus: [],

    updateWishListSkus: (skus: string[], action: string) => {
    if (skus.length === 0) return;

    set((state) => {
      let updatedSkus: string[] = [];

      switch (action) {
        case "ADD":
          updatedSkus = [...new Set([...state.wishListSkus, ...skus])];
          break;
        case "REMOVE":
          updatedSkus = state.wishListSkus.filter((sku) => !skus.includes(sku));
          break;
        case "UPDATE":
          updatedSkus = [...skus];
          break;
        default:
          updatedSkus = state.wishListSkus;
      }

      return { wishListSkus: updatedSkus };
    });
  },

  fetchWishList: async (productList: { sku: string | IProductList [] }[]) => {
    if (!productList?.length) return;
    const skuList = productList.map((p) => p.sku);
    try {
      const data = await getWishListByProductSkus(skuList.join(","));
      const fetchedSkus = data?.length ? data.map((item: { sku: string }) => item.sku) : [];
      get().updateWishListSkus(fetchedSkus, "UPDATE");
    } catch (error) {
      logClient.error("Failed to fetch wishlist", String(error));
    }
  },

  isSkuInWishList: (sku) => get().wishListSkus.includes(sku),
}));