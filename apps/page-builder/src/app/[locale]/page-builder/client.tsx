"use client";

import type { Data } from "@measured/puck";
import { PageEditor } from "@znode/page-builder";
import React, { useEffect, useState } from "react";
import { setPage } from "@znode/page-builder/utils/set-page";
import { SessionProvider } from "next-auth/react";
import { OverlayLoader } from "@znode/base-components/common/loader-component";
import { IPageStructure } from "@znode/types/visual-editor";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";

interface IClientProps {
  pageStructure: IPageStructure;
  themeName: string;
  url: string;
  storeCode?: string;
  pageCode?: string;
  contentPageCode?: string;
  mode?: string;
}
function Client(props: Readonly<IClientProps>) {
  const { url, themeName, pageStructure } = props || {};
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Prevent scroll events from changing input[type="number"] values
  useEffect(() => {
    const preventValueChangeOnScroll = (e: WheelEvent) => {
      if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === "number" && document.activeElement.contains(e.target as Node)) {
        e.preventDefault(); // Prevent value change
      }
    };

    const allowScroll = () => {
      // Allow scrolling for the rest of the page
      if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur(); // Unfocus input when scrolling starts
      }
    };

    document.addEventListener("wheel", preventValueChangeOnScroll, { passive: false });
    window.addEventListener("wheel", allowScroll);

    return () => {
      document.removeEventListener("wheel", preventValueChangeOnScroll);
      window.removeEventListener("wheel", allowScroll);
    };
  }, []);

  async function publishHandler(data: Data) {
    setIsLoading(true);
    const cloneData = JSON.parse(JSON.stringify(data));
    setPage({
      url,
      data: cloneData,
      theme: themeName,
    }).finally(() => {
      setIsLoading(false);
    });
  }

  let configType = "common";
  if (props.url.startsWith("category") || props.pageCode?.startsWith("category")) {
    configType = "category";
  } else if (props.url.startsWith("product") || props.pageCode?.startsWith("product")) {
    configType = "product";
  } else if (props.url.startsWith("brand/list") || props.pageCode?.startsWith("brandlist")) {
    configType = "brand-list";
  } else if (props.url.startsWith("brand") || props.pageCode?.startsWith("BrandDetails")) {
    configType = "brand-details";
  } else if (props.url.startsWith("blog/list") || props.pageCode?.startsWith("BlogList")) {
    configType = "blog-list";
  } else if (props.url.startsWith("blog") || props.pageCode?.startsWith("BlogDetails")) {
    configType = "blog-details";
  } else if (props.url.startsWith("store-locator") || props.pageCode?.startsWith("StoreLocator")) {
    configType = "store-locator";
  } else if (props.url.startsWith("contactus") || props.pageCode?.startsWith("contactus")) {
    configType = "contact-us";
  } else if (props.url.startsWith("feedback") || props.pageCode?.startsWith("feedback")) {
    configType = "feedback";
  } else if (props.url.startsWith("maintenance") || props.pageCode?.startsWith("maintenance")) {
    configType = "maintenance";
  } else if (props.url.startsWith(PAGE_CONSTANTS.URLS.HEADER) || props.pageCode?.startsWith(PAGE_CONSTANTS.URLS.HEADER)) {
    configType = PAGE_CONSTANTS.URLS.HEADER;
  } else if (props.url.startsWith(PAGE_CONSTANTS.URLS.FOOTER) || props.pageCode?.startsWith(PAGE_CONSTANTS.PAGE_CODES.FOOTER)) {
    configType = PAGE_CONSTANTS.URLS.FOOTER;
  } else if (props.pageCode?.startsWith(PAGE_CONSTANTS.PAGE_CODES.CART)) { 
    configType = PAGE_CONSTANTS.URLS.CART;
  } else if (props.pageCode?.startsWith(PAGE_CONSTANTS.PAGE_CODES.CHECKOUT)) {
    configType = PAGE_CONSTANTS.URLS.CHECKOUT;
  }

  return (
    <SessionProvider>
      <PageEditor
        pageStructure={pageStructure}
        onPublish={publishHandler}
        configParams={{
          theme: props.themeName,
          configType: configType,
        }}
        mode={props?.mode}
      />

      {isLoading && <OverlayLoader color="#fff" />}
    </SessionProvider>
  );
}

export default Client;
