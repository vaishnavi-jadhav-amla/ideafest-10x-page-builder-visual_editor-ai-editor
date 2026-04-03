"use client";

import { create } from "zustand";

interface IPromoLoadingStore {
  isPromoLoading: boolean;
  setIsPromoLoading: (_loading: boolean) => void;
}

export const usePromoLoadingStore = create<IPromoLoadingStore>((set) => ({
  isPromoLoading: false,
  setIsPromoLoading: (isPromoLoading) => set({ isPromoLoading }),
}));
