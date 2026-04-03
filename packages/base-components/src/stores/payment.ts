"use client";
import { create } from "zustand";
interface IPaymentStore {
  payment: {
    subTypeCode: string | null;
    configurationSetCode: string | null;
    configurationSetDisplayName: string | null;
    isOfflinePayment: boolean;
    invoiceOrderNumber: string | null;
    purchaseOrderNumber: string | null;
    purchaseOrderDocumentPath: string | null;
    paymentTransactionToken?: string | null;
  };
  setPaymentDetails: (_subType: string | null, _configurationSet: string | null, _configurationSetDisplayName: string | null, _isOfflinePayment: boolean) => void;
  setPurchaseOrderDetails: (_purchaseOrderNumber: string | null, _purchaseOrderDocumentPath: string | null) => void;
  setInvoiceOrderNumber: (_invoiceOrderNumber: string | null) => void;
  setPaymentTransactionToken: (_paymentTransactionToken: string | null) => void;
}

const usePaymentStore = create<IPaymentStore>((set) => ({
  payment: {
    subTypeCode: null,
    configurationSetCode: null,
    configurationSetDisplayName: null,
    isOfflinePayment: false,
    invoiceOrderNumber: null,
    purchaseOrderNumber: null,
    purchaseOrderDocumentPath: null,
    paymentTransactionToken: null,
  },
  setPaymentDetails: (subTypeCode: string | null, configurationSetCode: string | null, configurationSetDisplayName: string | null, isOfflinePayment: boolean) =>
    set((state) => ({
      payment: {
        ...state.payment,
        subTypeCode: subTypeCode,
        configurationSetCode: configurationSetCode,
        configurationSetDisplayName: configurationSetDisplayName,
        isOfflinePayment: isOfflinePayment,
      },
    })),
  setPurchaseOrderDetails: (purchaseOrderNumber: string | null, purchaseOrderDocumentPath: string | null) =>
    set((state) => ({ payment: { ...state.payment, purchaseOrderDocumentPath: purchaseOrderDocumentPath, purchaseOrderNumber: purchaseOrderNumber } })),
  setInvoiceOrderNumber: (invoiceOrderNumber: string | null) => set((state) => ({ payment: { ...state.payment, invoiceOrderNumber: invoiceOrderNumber } })),
  setPaymentTransactionToken: (paymentTransactionToken: string | null) => set((state) => ({ payment: { ...state.payment, paymentTransactionToken: paymentTransactionToken } })),
}));



export const usePayment = () => usePaymentStore();