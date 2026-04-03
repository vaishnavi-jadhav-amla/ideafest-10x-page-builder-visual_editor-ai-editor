"use client";

import { ICartSummary } from "@znode/types/cart";
import { create } from "zustand";

interface ICheckoutState {
  billingAddressId: number;
  setBillingAddressId: (_value: number) => void;
  orderSummaryData: ICartSummary;
  setOrderSummaryData: (_value: ICartSummary) => void;
  shippingAddressId: number;
  setShippingAddressId: (_value: number) => void;
  shippingOptionId: number | null;
  setShippingOptionId: (_value: number | null) => void;
  shippingConstraintCode: string | undefined;
  setShippingConstraintCode: (_value: string) => void;
  paymentSettingId: number | string | null;
  setPaymentSettingId: (_value: number | string | null) => void;
  isUnAssociatedProductEntity: boolean;
  setIsUnAssociatedProductEntity: (_value: boolean) => void;
  enterPinCode: string;
  setEnterPinCode: (_value: string) => void;
  isTaxExempt: boolean;
  setIsTaxExempt: (_value: boolean) => void;
}

const useCheckoutStore = create<ICheckoutState>((set) => ({
  billingAddressId: 0,
  setBillingAddressId: (value) => set({ billingAddressId: value }),
  orderSummaryData: 0,
  setOrderSummaryData: (value) => set({ orderSummaryData: value }),
  shippingAddressId: 0,
  setShippingAddressId: (value) => set({ shippingAddressId: value }),
  shippingOptionId: 0,
  setShippingOptionId: (value) => set({ shippingOptionId: value }),
  shippingConstraintCode: "ShipComplete",
  setShippingConstraintCode: (value) => set({ shippingConstraintCode: value }),
  paymentSettingId: 0,
  setPaymentSettingId: (value) => set({ paymentSettingId: value }),
  isUnAssociatedProductEntity: false,
  setIsUnAssociatedProductEntity: (value: boolean) => set({ isUnAssociatedProductEntity: value }),
  enterPinCode: "",
  setEnterPinCode: (value: string) => set({ enterPinCode: value }),
  isTaxExempt: false,
  setIsTaxExempt: (value: boolean) => set({ isTaxExempt: value }),
}));

export const useCheckout = () => useCheckoutStore();
