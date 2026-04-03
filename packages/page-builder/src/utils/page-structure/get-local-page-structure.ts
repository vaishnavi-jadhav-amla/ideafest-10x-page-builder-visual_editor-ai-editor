import type { Data } from "@measured/puck";
import { get } from "@znode/cache";
import { IPageVariant } from "../../types/page-builder";
import { INullablePageStructure } from "@znode/types/visual-editor";
import { createPageStructure, hasFooter, hasHeader, hasMainContent, hasNotAllOrLayout } from "../common";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";

const defaultData: Data = { content: [], zones: {}, root: {} };

async function getPageData(storeCode: string, key: string): Promise<Data> {
  const result = await get(storeCode, key);
  return result?.data || defaultData;
}

export async function getLocalPageStructure(storeCode: string, publicId: string, pageVariant: IPageVariant, hasDefaultPageStructure: boolean): Promise<INullablePageStructure> {
  try {
    let data: Data = { ...defaultData };
    let headerData: Data = { ...defaultData };
    let footerData: Data = { ...defaultData };

    if (hasMainContent(pageVariant, publicId)) {
      data = hasDefaultPageStructure ? defaultData : await getPageData(storeCode, publicId);
    }

    if (hasHeader(pageVariant)) {
      const headerJson = await getPageData(storeCode, PAGE_CONSTANTS.URLS.HEADER);

      if (hasNotAllOrLayout(pageVariant)) {
        data = headerJson;
      } else {
        headerData = headerJson;
      }
    }

    if (hasFooter(pageVariant)) {
      const footerJson = await getPageData(storeCode, PAGE_CONSTANTS.URLS.FOOTER);

      if (hasNotAllOrLayout(pageVariant)) {
        data = footerJson;
      } else {
        footerData = footerJson;
      }
    }

    return createPageStructure(publicId, data, headerData, footerData);
  } catch (error) {
    console.log("Error fetching local page structure:", error);
  }
  return null;
}
