/* eslint-disable @typescript-eslint/no-explicit-any */
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ExpandCollection, ExpandKeys, FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";
import { WebStoreContentPageListResponse, WebStoreContentPageModel, WebStoreContentPage_getContentPagesList } from "@znode/clients/v1";
import { FilterTuple, WebStoreWidgets_linkedCategoryByWidgetKey, WebStoreWidgets_slidersByWidgetKey } from "@znode/clients/v2";

import { IBannerSlider } from "@znode/types/slider-banner";
import { IContentPage } from "@znode/types/content-page";
import { IFilterTuple } from "@znode/types/filter";
import { IOfferBanners } from "@znode/types/offer-banner";
import { IPortalDetail } from "@znode/types/portal";
import { IWidget } from "@znode/types/widget";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export function generateKey(parameter: IWidget): string {
  try {
    const hasValidParams = parameter?.widgetCode && parameter.widgetKey && parameter.typeOfMapping && parameter.cmsMappingId;

    if (hasValidParams) {
      return `${parameter.widgetCode}${parameter.widgetKey}${parameter.typeOfMapping}${parameter.cmsMappingId}`;
    }
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
  }
  return "" as string;
}

export async function getSliderData(widget: IWidget): Promise<IBannerSlider | null> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.SLIDER_KEY},${CACHE_KEYS.DYNAMIC_TAG},${CACHE_KEYS.PAGE_MAPPING}`, widget.storeCode || "", widget.widgetKey, "SlidersByWidgetKey", String(widget.cmsMappingId)));  
    const slider = await WebStoreWidgets_slidersByWidgetKey(
      widget.widgetKey,
      widget.portalId,
      widget.localeCode,
      widget.typeOfMapping,
      widget.storeCode,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );

    const sliderData = slider.SliderBanners;

    if (!slider) return null;

    const commonSliderData = {
      cmsSliderBannerId: slider.CMSWidgetSliderBannerId,
      cmsSliderId: slider.CMSSliderId,
      localeId: slider.LocaleId,
    };

    const sliderBanners = sliderData?.map((item: any) => ({
      mediaId: item.MediaId,
      title: item.Title,
      imageAlternateText: item.ImageAlternateText,
      buttonLabelName: item.ButtonLabelName,
      buttonLink: item.ButtonLink,
      textAlignment: item.TextAlignment,
      bannerSequence: item.BannerSequence,
      description: item.Description,
      mediaPath: item.MediaPath,
      name: item.Name,
      fileName: item.FileName,
    }));

    return { commonSliderData, sliderBanners };
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}

export async function getOfferBannerData(widget: IWidget): Promise<IOfferBanners | null> {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.SLIDER_KEY}, ${CACHE_KEYS.DYNAMIC_TAG}, ${CACHE_KEYS.PAGE_MAPPING}`, widget.storeCode || "", widget.widgetKey, "SlidersByWidgetKey", String(widget.cmsMappingId)));
    const sliderData = await WebStoreWidgets_slidersByWidgetKey(
      widget.widgetKey,
      widget.portalId,
      widget.localeCode,
      widget.typeOfMapping,
      widget.storeCode,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const sliderBanner = sliderData?.SliderBanners as IOfferBanners;
    const offerBanner = sliderBanner?.map((banner: any) => ({
      buttonLink: banner.ButtonLink || "",
      description: banner?.Description,
      mediaPath: banner.MediaPath,
      title: banner?.Title || "",
    }));

    return offerBanner;
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}

export async function getContentPageData(widget: IWidget, portalData: IPortalDetail) {
  try {
    const contentPagesList: WebStoreContentPageListResponse = await getContentPageList(portalData);
    if (contentPagesList) {
      const contentPageData = contentPagesList.ContentPageList?.find(
        (x: WebStoreContentPageModel) =>
          x.ContentPageId === Number(widget.cmsMappingId) && x.TypeOFMapping === widget.typeOfMapping && x.WidgetsKey === widget.widgetKey && x.LocaleId === portalData.localeId
      );
      return {
        widgetsKey: contentPageData?.WidgetsKey,
        textWidgetConfigurationId: contentPageData?.TextWidgetConfigurationId,
        typeOFMapping: contentPageData?.TypeOFMapping,
        localeId: contentPageData?.LocaleId,
        text: contentPageData?.Text,
      } as IContentPage;
    }
    return null;
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}

async function getContentPageList(portalData: IPortalDetail) {
  const filters: IFilterTuple[] = await getFilterForContentPage(portalData);
  const contentPageList = await WebStoreContentPage_getContentPagesList(undefined, filters, undefined, undefined, undefined);
  return contentPageList;
}

async function getFilterForContentPage(portalData: IPortalDetail) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.LocaleId, FilterOperators.Equals, String(portalData.localeId));
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, String(portalData.portalId));
  filters.add(FilterKeys.ProfileIds, FilterOperators.In, String(portalData.profileId));
  return filters.filterTupleArray;
}

export async function getProductExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Promotions);
  expands.add(ExpandKeys.Pricing);
  expands.add(ExpandKeys.Seo);
  expands.add(ExpandKeys.AssociatedProducts);
  expands.add(ExpandKeys.Inventory);
  expands.add(ExpandKeys.ProductReviews);
  expands.add(ExpandKeys.ProductTemplate);
  expands.add(ExpandKeys.AddOns);
  expands.add(ExpandKeys.Brand);
  return expands;
}

export async function categories(widget: IWidget) {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, widget.storeCode || "", "LinkedCategoryByWidgetKey"));
    const categoriesData = await WebStoreWidgets_linkedCategoryByWidgetKey(
      widget.widgetKey,
      widget.portalId,
      widget.storeCode,
      widget.catalogCode,
      widget.localeCode,
      widget.typeOfMapping,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    if (categoriesData && categoriesData?.Categories && categoriesData?.Categories?.length > 0) {
      const filteredCategories = categoriesData?.Categories?.filter((category: any) => category?.PublishCategoryModel != null).map((category: any, idx: number) => {
        const { PublishCategoryModel } = category;
        return {
          id: PublishCategoryModel?.Name + idx,
          name: PublishCategoryModel?.Name,
          publishCategoryId: PublishCategoryModel?.PublishCategoryId,
          imageSmallPath: PublishCategoryModel?.ImageSmallPath,
          categoryCode: PublishCategoryModel?.CategoryCode,
          seoUrl: PublishCategoryModel?.SEODetails?.SEOUrl ?? "",
          categoryId: PublishCategoryModel?.PublishCategoryId,
        };
      });

      return filteredCategories;
    }
    return [];
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}
