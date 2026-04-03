import { IAttributesDetails, IStockNotificationRequest } from "@znode/types/product";
import { ICaptcha, IState } from "@znode/types/common";
import { ICompareProduct, IConfigurableProduct, IProductDetails, IQueryParams } from "@znode/types/product-details";

import { ICountryList } from "@znode/types/address";
import { IGeneralSetting } from "@znode/types/general-setting";
import { ILinkData } from "@znode/types/widget";
import { IPortalDetail } from "@znode/types/portal";
import { httpRequest } from "../base";
import { objectToQueryString } from "@znode/utils/component";

export const getGeneralSettingList = async () => {
  const generalSettingData = await httpRequest<{ generalSettingsList: IGeneralSetting }>({ endpoint: "/api/general-setting/get-general-setting" });
  return generalSettingData?.generalSettingsList || {};
};

export const getStateList = async (countryCode: string) => {
  const queryString: string = objectToQueryString({ countryCode: countryCode });

  const orderReceiptData = await httpRequest<IState[]>({ endpoint: `/api/common/get-state?${queryString}` });
  return orderReceiptData;
};

export const getReasonList = async () => {
  const reasonData = await fetch("/api/reason-list", { cache: "no-store" });
  const response = await reasonData.json();
  return response;
};

export const getPortalData = async () => {
  const portalData = await httpRequest<IPortalDetail>({ endpoint: "/api/common/portal-data" });
  return portalData;
};

export const getLinkPanelData = async (payload: { widgetKey: string; widgetCode: string; typeOfMapping: string }) => {
  const linkData = await httpRequest<ILinkData[]>({ endpoint: "/api/common/get-link-data", body: payload });
  return linkData;
};

export const submitStockRequest = async (payload: IStockNotificationRequest) => {
  const submitData = await httpRequest<{ isSuccess: boolean }>({ endpoint: "/api/common/stock-notification", body: payload });
  return submitData;
};

export const getContentBlockDetails = async (props: { inputKey: string }) => {
  const queryString: string = objectToQueryString(props);
  const contentBlockDetails = await fetch(`/api/content-block?${queryString}`, {
    cache: "no-store",
  });
  const response = await contentBlockDetails.json();
  return response;
};

export const getCountryList = async () => {
  const countryList = await httpRequest<ICountryList[]>({ endpoint: "/api/common/get-country" });
  return countryList;
};

export const getQuickDetails = async (productId: number, queryParams?: IQueryParams | null) => {
  const payload = queryParams ? { productId, queryParams } : { productId };
  const productData = await httpRequest<{ productBasicDetails: IProductDetails; configurableProducts: IConfigurableProduct[] }>({
    endpoint: "/api/quick-view",
    body: payload,
    method: "POST",
  });
  return productData;
};

export const getCaptchaData = async () => {
  const portalData = await httpRequest<ICaptcha>({ endpoint: "/api/common/get-captcha-details" });
  return portalData;
};

export const getCompareProductDetails = async ({ productList, isProductList }: { productList: ICompareProduct[]; isProductList: boolean }) => {
  const productData = await httpRequest<{ productList: ICompareProduct[]; comparableAttributes: IAttributesDetails[]; isLoginToSeePricing: boolean }>({
    endpoint: "/api/compare-product",
    body: { productList, isProductList },
  });
  return productData;
};
