"use client";

import { ICountryList } from "@znode/types/address";
import { IState } from "@znode/types/common";
import { create } from "zustand";

interface IAddressStore {
  countries: ICountryList[];
  setCountries: (_countries: ICountryList[]) => void;
  stateListData: IState[];
  setStateListData: (_stateListData: IState[]) => void;
}

const useAddressStore = create<IAddressStore>((set) => ({
  countries: [],
  setCountries: (countries) => set({ countries }),
  stateListData: [],
  setStateListData: (stateListData) => set({ stateListData }),
}));

export const useAddress = () => useAddressStore();
