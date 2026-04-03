"use client";

import { create } from "zustand";
import {IAnalytics} from "@znode/types/common";
import { IPortalLocale } from "@znode/types/portal";
interface CommonStore {
  portalLocale: IPortalLocale[];
  analyticsInfo: IAnalytics;
  isUserLoggedIn: boolean;
  isEnableQuoteRequest:boolean | undefined;
  setPortalLocale: (_data: IPortalLocale[]) => void;
  setAnalyticsInfo: (_data: IAnalytics) => void;
  setUserLoggedIn: (_data: boolean) => void;
  setEnableQuoteRequest:(_data:boolean)=>void;
}

const useCommonStore = create<CommonStore>((set) => ({
  portalLocale: [],
  isEnableQuoteRequest:undefined,
  analyticsInfo: {
    containerId: "",
    analyticsUId: "",
    isEnabledTagManager: false,
    isEnabledAnalytics: false,
    isEnabledEnhancedEcommerce: false,
    trackingPixelScript:""
  },
  isUserLoggedIn: false,
  setPortalLocale: (_data) =>
    set(() => ({
      portalLocale: _data,
    })),
    setAnalyticsInfo: (_data: IAnalytics) =>
      set(() => ({
        analyticsInfo: _data,
      })),  
  setUserLoggedIn: (_status) =>
    set(() => ({
      isUserLoggedIn: _status,
    })),
  setEnableQuoteRequest: (_status:boolean) =>
    set(() => ({
      isEnableQuoteRequest: _status,
    })),
}));

export const useCommonDetails = () => useCommonStore();