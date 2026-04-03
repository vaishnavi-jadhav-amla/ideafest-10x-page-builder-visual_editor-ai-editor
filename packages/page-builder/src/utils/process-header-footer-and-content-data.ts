import type { Data } from "@measured/puck";
import { IPageStructure } from "@znode/types/visual-editor";
import { preparedContentItem } from "./prepared-content-item";
import { IPageVariant } from "./get-page";
import { ENABLE_GRANULAR_WIDGET_CACHING } from "@znode/page-builder/constants";

const emptyData: Data = {
  content: [],
  root: {},
  zones: {},
};

export const stopMergingWidgetDataWithLayout = "true";

interface IProcessContentParams {
  data: Data | undefined;
  id: string | null;
  searchParams: any;
  contentPageId?: number;
  pageVariant?: IPageVariant;
  key?: string;
  isDynamic?: boolean;
}

type IProcessHeaderFooterAndMainContentDataParams = {
  pageStructure: IPageStructure;
} & Omit<IProcessContentParams, "data">;


export const widgetPageData: any = {
  "category_{id}": "ProductListPage",
};

export async function processHeaderFooterAndMainContentData(params: IProcessHeaderFooterAndMainContentDataParams, isDynamic?: boolean) {
  const { pageStructure, id, searchParams, contentPageId } = params;
  const [mainResult, headerResult, footerResult] = await Promise.all([
    processContent({
      data: pageStructure.data,
      id: id,
      searchParams: searchParams,
      contentPageId: contentPageId,
      key: pageStructure.key,
      isDynamic: isDynamic
    }),
    processContent({
      data: pageStructure.headerData,
      id: id,
      searchParams: searchParams,
      contentPageId: contentPageId,
      pageVariant: "Layout",
    }),
    processContent({
      data: pageStructure.footerData,
      id: id,
      searchParams: searchParams,
      contentPageId: contentPageId,
      pageVariant: "Layout",
    }),
  ]);

  return {
    headerData: headerResult,
    footerData: footerResult,
    mainData: mainResult,
  };
}
export async function processContent(params: IProcessContentParams): Promise<Data> {
  if (params?.data && typeof params?.data === "object" && Array.isArray(params?.data.content)) {
    if(!params?.isDynamic && ENABLE_GRANULAR_WIDGET_CACHING && params.key && widgetPageData[params?.key]){
      return params.data;
    }
    return await preparedContentItem(params.data, params?.id, params?.searchParams, params?.contentPageId, params?.pageVariant);
  }
  return emptyData;
}
