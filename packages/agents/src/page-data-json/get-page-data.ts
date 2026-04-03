/* eslint-disable @typescript-eslint/no-explicit-any */

import { categories, getOfferBannerData, getSliderData } from "../widget";

import { getContentContainer } from "../content-container";
import { getPortalHeader } from "@znode/utils/server";
import { getProductWidgetList } from "../product";
import { getBrandWidgetList } from "../brand";

interface ISharedWidgetParams {
  widgetKey: string;
  widgetCode?: string;
  typeOfMapping: string;
  portalId: number;
  localeId: number;
}

interface IGetPageParams {
  widgetComponentKey: string;
  widgetKey: string;
  typeOfMapping: string;
}

const widgetFunctionMap = new Map<string, any>([
  ["BannerSlider", getSliderData],
  ["OfferBanner", getOfferBannerData],
  ["Categories", categories],
  ["ProductsCarousel", getProductWidgetList],
  ["BrandsCarousel", getBrandWidgetList],
  ["ContentContainer", getContentContainer],
]);

export async function getPageData(params: IGetPageParams): Promise<any> {
  const { widgetComponentKey, widgetKey, typeOfMapping } = params;
  const portalHeader = await getPortalHeader();

  const sharedParams: ISharedWidgetParams = {
    widgetKey,
    widgetCode: "", // TODO: this should be removed later, not using B.E
    typeOfMapping,
    portalId: portalHeader.portalId,
    localeId: portalHeader.localeId,
  };

  const widgetCallback = widgetFunctionMap.get(widgetComponentKey);
  if (!widgetCallback) return null;

  const result = await widgetCallback(sharedParams);
  return result;
}
