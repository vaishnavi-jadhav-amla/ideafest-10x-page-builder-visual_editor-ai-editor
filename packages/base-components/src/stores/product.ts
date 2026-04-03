"use client";

import { ICompareProduct, IConfigurableProduct, IProductDetails } from "@znode/types/product-details";

import { IAddToCartNotification } from "@znode/types/cart";
import { IDynamicFormDefault } from "@znode/types/quick-order";
import { IProductAddOn } from "@znode/types/product";
import { create } from "zustand";
import { setLocalStorageData } from "@znode/utils/component";
import { IFacetArray } from "@znode/types/facet";

type IAddToCartNotificationParams = IProductDetails | IAddToCartNotification | null;
interface IProductStore {
  product: {
    productId: number | null;
    cartCount: number;
    selectedAddons: IProductAddOn[];
    addToCartTriggerNotification: boolean;
    addToCartNotificationData: IAddToCartNotificationParams;
    quickViewData: { productBasicDetails: IProductDetails; configurableProducts: IConfigurableProduct[] } | null;
    isReviewTriggered: boolean;
    isViewReplacementProductTriggered: boolean;
    isAddToCart: boolean;
    isPersonalized: boolean;
    addOnValidation: { [key: string]: string };
    compareProductList: ICompareProduct[] | null;
    compareProductMessage: string | null;
    productOutOfStock: { productId: number; message: string };
    quickOrderProductInfo: IDynamicFormDefault[] | [];
    isGroupProduct: { addToCart: boolean; message: string; productId: number; sku: string }[];
  };
  activeFacetLoader: { [key: string]: boolean };
  isProductLoading: boolean;
  activeFacetData: IFacetArray[];
  activeCategory: string;
  updateProductId: (_id: number) => void;
  updateCartCount: (_count: number) => void;
  setProductId: (_id: number) => void;
  // selectedAddons: () => IProductAddOn[];
  setSelectedAddons: (_addonData: IProductAddOn[]) => void;
  setIsGroupProduct: (_childList: { addToCart: boolean; message: string; productId: number; sku: string }[]) => void;
  setAddToCartTriggerNotification: (_notification: boolean) => void;
  setAddToCartNotificationData: (_productData: IAddToCartNotificationParams) => void;
  setQuickViewData: (_data: { productBasicDetails: IProductDetails; configurableProducts: IConfigurableProduct[] } | null) => void;
  setIsReviewTriggered: (_value: boolean) => void;
  setIsAddToCart: (_value: boolean) => void;
  setIsPersonalized: (_value: boolean) => void;
  setAddOnValidation: (_value: { [key: string]: string }) => void;
  setIsViewReplacementProductTriggered: (_value: boolean) => void;
  updateCompareProduct: (_product: ICompareProduct) => void;
  updateCompareProductList: (_product: ICompareProduct[]) => void;
  updateCompareProductMessage: (_message: string | null) => void;
  deleteCompareProduct: (_productId: number) => void;
  deleteAllCompareProduct: () => void;
  setProductOutOfStock: (_product: { productId: number; message: string }) => void;
  setQuickOrderProductInfo: (_product: IDynamicFormDefault[]) => void;
  setIsProductLoading: (_val: boolean, _activeLoader: { [key: string]: boolean }) => void;
  setActiveFacetData: (_facet: IFacetArray[]) => void;
  setActiveCategory: (_activeCategory: string) => void;

}

const getCompareProductList = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("compareProductList");
  }
  return null;
};

const compareProductList = getCompareProductList();

const useProductStore = create<IProductStore>((set) => ({
  activeFacetLoader: {},
  isProductLoading: false,
  activeFacetData: [],
  activeCategory: "",
  product: {
    productId: null,
    cartCount: 0,
    selectedAddons: [],
    addToCartTriggerNotification: false,
    addToCartNotificationData: null,
    quickViewData: null,
    isReviewTriggered: false,
    isViewReplacementProductTriggered: false,
    isAddToCart: false,
    isPersonalized: false,
    addOnValidation: {},
    compareProductList: compareProductList ? JSON.parse(compareProductList) : null,
    compareProductMessage: null,
    productOutOfStock: { productId: 0, message: "" },
    quickOrderProductInfo: [],
    isGroupProduct: [],
  },
  updateProductId: (id: number) => set((state) => ({ product: { ...state.product, productId: id } })),
  updateCartCount: (_count: number) => set((state) => ({ product: { ...state.product, cartCount: _count } })),
  setProductId: (id: number) => set((state) => ({ product: { ...state.product, id } })),
  setIsGroupProduct: (childList: { addToCart: boolean; message: string; productId: number; sku: string }[]) =>
    set((state) => ({ product: { ...state.product, isGroupProduct: childList } })),
  setSelectedAddons: (addonData: IProductAddOn[]) => set((state) => ({ product: { ...state.product, selectedAddons: addonData } })),
  setQuickViewData: (productInfo: { productBasicDetails: IProductDetails; configurableProducts: IConfigurableProduct[] } | null) =>
    set((state) => ({ product: { ...state.product, quickViewData: productInfo } })),
  setAddToCartTriggerNotification: (notification: boolean) => set((state) => ({ product: { ...state.product, addToCartTriggerNotification: notification } })),
  setAddToCartNotificationData: (productData: IAddToCartNotificationParams) => set((state) => ({ product: { ...state.product, addToCartNotificationData: productData } })),
  setIsReviewTriggered: (value: boolean) => set((state) => ({ product: { ...state.product, isReviewTriggered: value } })),
  setIsAddToCart: (value: boolean) => set((state) => ({ product: { ...state.product, isAddToCart: value } })),
  setIsPersonalized: (value: boolean) => set((state) => ({ product: { ...state.product, isPersonalized: value } })),
  setIsViewReplacementProductTriggered: (value: boolean) => set((state) => ({ product: { ...state.product, isViewReplacementProductTriggered: value } })),
  setAddOnValidation: (value: { [key: string]: string }) => set((state) => ({ product: { ...state.product, addOnValidation: { ...state.product.addOnValidation, ...value } } })),
  updateCompareProduct: (product: ICompareProduct) =>
    set((state) => ({ product: { ...state.product, compareProductList: state.product.compareProductList ? [...state.product.compareProductList, product] : [product] } })),
  updateCompareProductList: (productList: ICompareProduct[]) => set((state) => ({ product: { ...state.product, compareProductList: productList } })),
  updateCompareProductMessage: (message: string | null) => set((state) => ({ product: { ...state.product, compareProductMessage: message } })),
  deleteCompareProduct: (productId: number) =>
    set((state) => {
      const updatedProductList = state.product.compareProductList?.filter((item) => item.productId !== productId) || null;
      setLocalStorageData("compareProductList", JSON.stringify(updatedProductList));
      return { product: { ...state.product, compareProductList: updatedProductList } };
    }),
  deleteAllCompareProduct: () =>
    set((state) => {
      setLocalStorageData("compareProductList", JSON.stringify(null));
      return { product: { ...state.product, compareProductList: null } };
    }),

  setProductOutOfStock: (_product: { productId: number; message: string }) =>
    set((state) => ({
      product: {
        ...state.product,
        productOutOfStock: _product,
      },
    })),
  setQuickOrderProductInfo: (_product: IDynamicFormDefault[]) =>
    set((state) => ({
      product: { ...state.product, quickOrderProductInfo: _product },
    })),
  setIsProductLoading: (val, activeLoader) => set({ isProductLoading: val, activeFacetLoader: activeLoader }),
  setActiveFacetData: (val) => set({ activeFacetData: val }),
  setActiveCategory: (activeCategory="") => set({ activeCategory }),


}));

export const useProduct = () => useProductStore();
