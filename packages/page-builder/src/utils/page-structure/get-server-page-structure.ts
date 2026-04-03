import type { Data } from "@measured/puck";
import { IPageVariant } from "../../types/page-builder";
import { IExtendedData, INullablePageStructure } from "@znode/types/visual-editor";
import { getPreviewContentPageDetails, getPreviewPageDetails, getProductionContentPageDetails, getProductionPageDetails } from "@znode/base-components/http-request";
import { createPageStructure, hasFooter, hasHeader, hasMainContent, hasNotAllOrLayout } from "../common";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";

const defaultData: IExtendedData = { content: [], zones: {}, root: {}, isPageUnavailable: true };

// ** Production or Preview Page Json
async function fetchProductionOrPreviewPageStructure(
  pageCode: string,
  contentPageCode: string,
  storeCode: string,
  publishState: string,
  versionNumber?: number
): Promise<INullablePageStructure> {
  if (publishState === "production") {
    return contentPageCode ? getProductionContentPageDetails({ contentPageCode, portalCode: storeCode }) : getProductionPageDetails({ pageCode, portalCode: storeCode });
  }

  return contentPageCode
    ? getPreviewContentPageDetails({ contentPageCode, portalCode: storeCode, versionNumber })
    : getPreviewPageDetails({ pageCode, portalCode: storeCode, versionNumber });
}

async function getPageData(pageCode: string, contentPageCode: string, storeCode: string, publishState: string, versionNumber?: number): Promise<Data> {
  const result = await fetchProductionOrPreviewPageStructure(pageCode, contentPageCode, storeCode, publishState, versionNumber);
  const data= result?.data
   const isValidObject =
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Object.keys(data).length > 0;
    if(isValidObject){
      data.pageVersion=result?.pageVersion||1
      return data;
    }
  return defaultData;
}

export async function getServerPageStructure(
  pageCode: string,
  contentPageCode: string,
  storeCode: string,
  publishState: string,
  publicId: string,
  pageVariant: IPageVariant,
  hasDefaultPageStructure: boolean,
  versionNumber?: number
): Promise<INullablePageStructure> {
  try {
    let data: Data &{pageVersion?:number} = { ...defaultData };
    let headerData: Data = { ...defaultData };
    let footerData: Data = { ...defaultData };
    if (hasMainContent(pageVariant, publicId)) {
      data = hasDefaultPageStructure ? defaultData : await getPageData(pageCode ?? "", contentPageCode ?? "", storeCode ?? "", publishState, versionNumber);
    }

    if (hasHeader(pageVariant)) {
      const pageCode = PAGE_CONSTANTS.PAGE_CODES.HEADER;
      const contentPageCode = "";
      const hasHeaderPage = hasNotAllOrLayout(pageVariant);
      let version: number | undefined = undefined;

      if (hasHeaderPage) {
        version = versionNumber;
      }

      const headerJson = await getPageData(pageCode ?? "", contentPageCode, storeCode ?? "", publishState, version);

      if (hasHeaderPage) {
        data = headerJson;
      } else {
        headerData = headerJson;
      }
    }

    if (hasFooter(pageVariant)) {
      const pageCode = PAGE_CONSTANTS.PAGE_CODES.FOOTER;
      const contentPageCode = "";
      const hasFooterPage = hasNotAllOrLayout(pageVariant);
      let version: number | undefined = undefined;

      if (hasFooterPage) {
        version = versionNumber;
      }

      const footerJson = await getPageData(pageCode ?? "", contentPageCode, storeCode ?? "", publishState, version);

      if (hasFooterPage) {
        data = footerJson;
      } else {
        footerData = footerJson;
      }
    }

    return createPageStructure(publicId, data, headerData, footerData);
  } catch (error) {
    console.log("Error getting", error);
  }

  return null;
}
