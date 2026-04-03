import { ISearchParams } from "@znode/types/search-params";
import { IPageStructure } from "@znode/types/visual-editor";
import { getPage } from "./get-page";
import { validateAndGenerateSeoUrl } from "./validate-and-generate-seo-url";
import { SEO_SETTINGS } from "@znode/constants/seo-types";
import { checkDefaultWidgetHasData } from "@znode/utils/common";
import { PAGE_DEFAULT_WIDGET } from "@znode/constants/page-builder";

export const pageWidgetData: { [key: string]: { rootWidgetName: string; responsePropsName: string } } = {
  product: PAGE_DEFAULT_WIDGET.PDP_PAGE,
  category: PAGE_DEFAULT_WIDGET.PLP_PAGE,
  "brand-details": PAGE_DEFAULT_WIDGET.BRAND_DETAIL,
  "blog-details": PAGE_DEFAULT_WIDGET.BLOG_DETAIL,
};
export const getPageStructure = async (url: string, searchParams: ISearchParams, themeName: string, configType: string, contentPageCode?: string, contentPageId?: number) => {
  let isNotFound = false;
  let viewCustom404 = false;
  let pageStructure: IPageStructure = await getPage({
    url,
    searchParams,
    theme: themeName, // theme1, theme2
    contentPageCode,
    contentPageId,
  });
  if (!pageStructure.data.content.length) {
    isNotFound = true;
    if (configType === "content" && pageStructure.data?.isPageUnavailable) {
      // for rendering 404 content page
      const { updatedPageStructure, updatedViewCustom404, updatedIsNotFound } = await checkFor404(themeName);
      pageStructure = updatedPageStructure;
      viewCustom404 = updatedViewCustom404;
      isNotFound = updatedIsNotFound;
    }
  } else if (configType !== "content" && checkDefaultWidgetHasData(pageStructure.data.content, pageWidgetData[configType], configType)) {
    configType = "content";
    // for rendering 404 content page
    const { updatedPageStructure, updatedIsNotFound, updatedViewCustom404 } = await checkFor404(themeName);
    pageStructure = updatedPageStructure;
    isNotFound = updatedIsNotFound;
    viewCustom404 = updatedViewCustom404;
  }

  return { pageStructure, isNotFound, viewCustom404, updatedConfigType: configType };
};

const get404PageStructure = async (themeName: string) => {
  let url = "";
  const seoData = await validateAndGenerateSeoUrl("404");
  let contentPageCode;
  let contentPageId;
  if (seoData  && (seoData.seoId ||seoData.seoCode)) {
    const seoTypeName = String(seoData.name).toLowerCase();
    const seoId = seoData.seoId;
    url = `${seoTypeName}/${seoId}`;
    if (seoTypeName === SEO_SETTINGS.CONTENT_PAGE) {
      contentPageCode = seoData.seoCode;
      contentPageId = seoData.seoId;
    }
  }
  return await getPage({
    url,
    searchParams: {},
    theme: themeName,
    contentPageCode,
    contentPageId,
  });
};

const checkFor404 = async (themeName: string) => {
  let updatedIsNotFound = false;
  let updatedViewCustom404 = false;

  const updatedPageStructure = await get404PageStructure(themeName);
  // for rendering custom 404
  if (updatedPageStructure.data?.isPageUnavailable) {
    updatedIsNotFound = true;
    updatedViewCustom404 = true;
  }

  return { updatedPageStructure, updatedIsNotFound, updatedViewCustom404 };
};
