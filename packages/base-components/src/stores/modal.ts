"use client";

import { create } from "zustand";

interface IModalState {
  modalActiveId: string;
}

interface IMenuState {
  isMenuShown: boolean;
  isInventory: boolean;
  inventoryId: string | null;
  setIsMenuShown: (_shown: boolean) => void;
}

interface IModalAction {
  openModal: (_modalId: IModalState["modalActiveId"]) => void;
  closeModal: () => void;
}

const useModalStore = create<IModalState & IModalAction & IMenuState>((set) => ({
  modalActiveId: "",
  isMenuShown: false,
  isInventory: false,
  inventoryId: null,
  openModal: (modalId) => {
    document.body.classList.add("overflow-hidden");
    set((state) => ({
      modalActiveId: modalId === "InventoryDetails" ? state.modalActiveId : modalId,
      isInventory: modalId === "InventoryDetails",
      inventoryId: modalId === "InventoryDetails" ? modalId : null,
    }));
  },
  closeModal: () => {
    set((state) => {
      const isActive = state.inventoryId === "InventoryDetails" ? state.modalActiveId : "";
      isActive === "" &&  document.body.classList.remove("overflow-hidden");
      return {modalActiveId: state.inventoryId === "InventoryDetails" ? state.modalActiveId : "", isInventory: false, inventoryId: null};
  });
  },
  setIsMenuShown: (shown) => set({ isMenuShown: shown }),
}));

// Custom hook
export const useModal = () => useModalStore();
