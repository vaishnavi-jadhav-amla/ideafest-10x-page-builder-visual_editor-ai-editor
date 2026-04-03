"use client";

import { IMegaMenuCategory, ISubCategoryItemsData } from "@znode/types/category";
import { create } from "zustand";
import { getWebStoreCategory } from "../http-request/category";
interface CategoryStore {
  category: IMegaMenuCategory[];
  loading: boolean;
  isUserLoggedIn: boolean;
  hasAllCategoriesLoaded: boolean;
  subcategoryCache: { [key: string]: { data: ISubCategoryItemsData[] | null; isLoading: boolean } };
  setCategory: (_data: IMegaMenuCategory[]) => void;
  setUserLoggedIn: (_data: boolean) => void;
  fetchCategories: () => Promise<void>;
}

const useCategoryStore = create<CategoryStore>((set) => ({
  category: [],
  loading: false,
  isUserLoggedIn: false,
  subcategoryCache: {},
  hasAllCategoriesLoaded: false,
  setCategory: (_data) => {
    set(() => ({
      category: _data,
    }));
  },
  setUserLoggedIn: (_status) =>
    set(() => ({
      isUserLoggedIn: _status,
    })),

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const categoryData = await getWebStoreCategory("", true);
      set({ category: categoryData?.categories || [], loading: false, hasAllCategoriesLoaded: true, isUserLoggedIn: categoryData?.isUserLoggedIn || false });
    } catch (_error) {
      set({ loading: false });
    }
  },
}));

export const useCategoryDetails = () => useCategoryStore();
