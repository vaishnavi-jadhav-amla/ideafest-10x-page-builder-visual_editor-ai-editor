"use client";

import { ToastOptions, toast } from "react-toastify";

import { create } from "zustand";

// Define the types for the toast store actions
interface ToastStore {
  success: (_message: string, _options?: ToastOptions) => void;
  error: (_message: string, _options?: ToastOptions) => void;
  warning: (_message: string) => void;
  info: (_message: string) => void;
  isActiveToast: (_id: string | number) => boolean;
}

// Zustand store for Toasts
const useToastStore = create<ToastStore>(() => ({
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, options);
  },
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, options);
  },
  warning: (message: string) => {
    toast.warn(message);
  },
  info: (message: string) => {
    toast.info(message);
  },
  isActiveToast: (id: string | number) => toast.isActive(id),
}));



// Custom hook to access toast actions
export const useToast = () => useToastStore();
