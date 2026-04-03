"use client";

import { IQuery } from "@znode/types/product";
import { create } from "zustand";

interface IAddressStore {
  quickViewVariant: IQuery;
  setQuickViewVariant: (_quickViewVariantParams: IQuery) => void;
}

const useQuickViewVariantStore = create<IAddressStore>((set) => ({
  quickViewVariant: {} as IQuery,
  setQuickViewVariant: (quickViewVariant) => set({ quickViewVariant }),
}));

export const useQuickViewVariant = () => useQuickViewVariantStore();
