"use client";

import { IUser } from "@znode/types/user";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getSavedUserSessionCallForClient } from "@znode/utils/common";

interface IUserStore {
  user: IUser | null;
  isUserSessionLoading: boolean;
  sessionFetched: boolean; // flag to check if session has been fetched
  loadUser: (_shouldRefresh?: boolean, _defaultUserData?: IUser | null) => Promise<void>;
  clearUser: () => void;
}

const useUserStore = create<IUserStore>()(
  devtools<IUserStore>((set, get) => ({
    user: null as IUser | null,
    isUserSessionLoading: false,
    sessionFetched: false,
    loadUser: async (shouldRefresh = false, defaultUserData = null) => {
      const { sessionFetched, isUserSessionLoading } = get();
      if (isUserSessionLoading || sessionFetched) {
        return;
      }

      set({ isUserSessionLoading: true });
      try {
        const userSession = defaultUserData && !shouldRefresh ? (defaultUserData as IUser) : await getSavedUserSessionCallForClient(shouldRefresh);
        set({ user: userSession, sessionFetched: sessionFetched ? true : false });
      } catch (error) {
        set({ user: null, sessionFetched: false });
      } finally {
        set({ isUserSessionLoading: false });
      }
    },

    clearUser: () => set({ user: null, sessionFetched: false }),
  }))
);

export const useUser = () => useUserStore();
export default useUserStore;
