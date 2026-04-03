"use client";

import React, { ReactNode } from "react";
import { PageRender } from "../page-render/PageRender";
import { PAGE_CONSTANTS } from "../constants/constants";
import { IPageEditorProps } from "./PageEditor";
import type { Data } from "@measured/puck";

type IPageEditorLayoutProps = Omit<IPageEditorProps, "onPublish"> & { children: ReactNode };
export function PageEditorLayout(props: Readonly<IPageEditorLayoutProps>) {
  const { configParams, pageStructure, children } = props || {};

  const headerData: Data = pageStructure?.headerData || { content: [], zones: {}, root: {} };
  const footerData: Data = pageStructure?.footerData || { content: [], zones: {}, root: {} };

  const isHeaderOrFooter = PAGE_CONSTANTS.ARRAYS.HEADER_FOOTER_PAGE_URL.includes(configParams.configType);
  const isMaintenance = configParams.configType == PAGE_CONSTANTS.PAGE_CODES.MAINTENANCE ? true : false;
  const header = isHeaderOrFooter ? (
    <div className="h-[50px]"></div>
  ) : (
    <PageRender data={headerData} configParam={{ ...configParams, configType: PAGE_CONSTANTS.URLS.HEADER }} />
  );

  const footer = !isHeaderOrFooter && <PageRender data={footerData} configParam={{ ...configParams, configType: PAGE_CONSTANTS.URLS.FOOTER }} />;

  if (isMaintenance) {
    return (
      <React.Fragment>
        <div className="h-[50px]"></div>
        {children}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {header}
      {children}
      {footer}
    </React.Fragment>
  );
}
