"use client";

import { create } from "zustand";

interface ICartStore {
  cartSummaryRefresher: number;
  cartItemsRefresher: number;
  saveLaterItemsRefresher: number;
  clearCart: number;
  refreshCartSummary: () => void;
  refreshCartItems: () => void;
  refreshSaveLaterItems: () => void;
  clearCartData: () => void;
  saveForLaterId: string | null;
  setSaveForLaterId: (_value: string | null) => void;
}
const maxNumber = 5000;
const useCartStore = create<ICartStore>((set) => ({
  cartDiscount: { promotions: [], vouchers: [], },
  cartSummaryRefresher: 0,
  cartItemsRefresher: 0,
  clearCart: 0,
  saveLaterItemsRefresher: 0,
  refreshCartSummary: () => set(() => ({ cartSummaryRefresher: Math.floor(Math.random() * maxNumber) + 1 })),
  refreshCartItems: () => set(() => ({ cartItemsRefresher: Math.floor(Math.random() * maxNumber) + 1 })),
  clearCartData: () => set(() => ({ clearCart: Math.floor(Math.random() * maxNumber) + 1 })),
  refreshSaveLaterItems: () => set(() => ({ saveLaterItemsRefresher: Math.floor(Math.random() * maxNumber) + 1 })),
  saveForLaterId: null,
  setSaveForLaterId: (value) => set({ saveForLaterId: value }),
}));

export const useCartDetails = () => useCartStore();
