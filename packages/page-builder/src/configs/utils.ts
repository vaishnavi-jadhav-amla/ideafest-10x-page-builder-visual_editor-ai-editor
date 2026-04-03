import { PAGE_CONSTANTS } from "@znode/page-builder/constants";
import { IConfigParam } from "../types/page-builder";
import {getConfig as  getLayoutConfig } from "./get-layout-config";

export const headerFooterConfig = (configParams: IConfigParam) => {
  if(configParams.configType === PAGE_CONSTANTS.URLS.HEADER || configParams.configType === PAGE_CONSTANTS.URLS.FOOTER)
  {
    return getLayoutConfig(configParams);
  }else {
    return null;
  }
}