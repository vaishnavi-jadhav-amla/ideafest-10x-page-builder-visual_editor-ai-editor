/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Data } from "@measured/puck";

export interface IExtendedData extends Data {
  isPageUnavailable?: boolean;
  pageVersion?: number;
}

 export interface PWidget  {
    widgetKey: string;
    type: string;
  };

export interface IPageStructure {
  key: string;
  data: IExtendedData;
  headerData?: Data;
  footerData?: Data;
  widgets?:PWidget[];
  pageVersion?: number;
}

export type INullablePageStructure = IPageStructure | null;
