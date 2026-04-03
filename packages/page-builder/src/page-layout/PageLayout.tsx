"use client";
import { type Data, Render } from "@measured/puck";
import type { IConfigParam } from "../types/page-builder";
import { ReactNode, useMemo } from "react";
import { PAGE_CONSTANTS } from "../constants/constants";
import { IPageStructure } from "@znode/types/visual-editor";
import { getConfig } from "../configs/get-layout-config";

type PageEditorProps = {
  configParams: IConfigParam;
  children: ReactNode;
  pageStructure: IPageStructure;
};

export function PageLayout(props: Readonly<PageEditorProps>) {
  const { configParams, children, pageStructure } = props || {};
  const headerData: Data = pageStructure?.headerData || { content: [], zones: {}, root: {} };
  const footerData: Data = pageStructure?.footerData || { content: [], zones: {}, root: {} };

  const [headerConfig, footerConfig] = useMemo(() => {
    return getConfig([{ ...configParams, configType: PAGE_CONSTANTS.URLS.HEADER }, { ...configParams, configType: PAGE_CONSTANTS.URLS.FOOTER }]);
  }, []);

  return (
    <>
      <Render data={headerData} config={headerConfig} />
      {children}
      <Render data={footerData} config={footerConfig} />
    </>
  );
}
