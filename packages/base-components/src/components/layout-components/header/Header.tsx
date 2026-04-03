"use client";

import "./header.scss";

import { ReactNode, useEffect, useRef, useState } from "react";
import { TopMenu, WebstoreMenu } from "./top-menu";

import { IAnalytics } from "@znode/types/common";
import { IHeaderConfig } from "@znode/types/headers";
import { IMegaMenuCategory } from "@znode/types/category";
import { IPermissions } from "@znode/types/user";
import { IPortalLocale } from "@znode/types/portal";
import { Logo } from "./logo";
import { Navigation } from "./navigation/Navigation";
import { ScrollToTop } from "../../common/scroll-to-top";
import { Search } from "./search";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useCategoryDetails } from "../../../stores/category";
import { useCommonDetails } from "../../../stores/common";
import { useProduct } from "../../../stores/product";

//nx-ignore-next-line
const ImpersonationBar = dynamic(() => import("../../impersonation").then((mod) => mod.ImpersonationBar), { ssr: false });
//nx-ignore-next-line
const MobileHeader = dynamic(() => import("./mobile-navigation/MobileHeader").then((mod) => mod.default), { ssr: false });
interface IHeaderProps {
  configurations: IHeaderConfig;
  categoryList: IMegaMenuCategory[];
  userLoggedIn: boolean;
  portalLocales: IPortalLocale[];
  analyticsInfo: IAnalytics;
  cartCount: number;
  elementTop: ReactNode;
  elementBottom: ReactNode;
  elementLinkPanel: ReactNode;
  elementMobileLinkPanel: ReactNode;
  isEnableQuoteRequest: boolean;
  permission: IPermissions | null;
}

export function Header(props: Readonly<IHeaderProps>) {
  const { configurations, categoryList, userLoggedIn, portalLocales, analyticsInfo, cartCount, isEnableQuoteRequest, permission } = props || {};
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { setCategory, setUserLoggedIn, loading } = useCategoryDetails();
  const { setPortalLocale, setAnalyticsInfo, setEnableQuoteRequest } = useCommonDetails();
  const { updateCartCount } = useProduct();
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    updateCartCount(cartCount);
    setUserLoggedIn(userLoggedIn);
    setPortalLocale(portalLocales);
    setAnalyticsInfo(analyticsInfo);
    setEnableQuoteRequest(isEnableQuoteRequest);
    categoryList && !loading && setCategory(categoryList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryList]);

  const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);

  const debouncedResize = debounce(checkIsMobile, 300);

  useEffect(() => {
    checkIsMobile();
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollToTop headerRef={headerRef} />
      <header id="webstore-header" ref={headerRef} className="sticky top-0 z-40 w-full mb-4 shadow-md bg-headerBgColor no-print">
        {userLoggedIn && <ImpersonationBar />}
        {props.elementTop}
        {!isMobile ? (
          <div className="desktop-header relative">
            <WebstoreMenu configurations={configurations} />
            <div className="flex items-center justify-between gap-3 px-4 py-6">
              <div className="pr-3" data-test-selector="divLogoImage">
                <Logo customClass="h-16 object-contain" imgSrc={configurations.logo.url} alternate="logo" width={200} height={60} dataTestSelector="imgDesktopLogo" />
              </div>

              <div className="relative flex items-center flex-1" data-test-selector="divSearchText">
                <div className="w-full">
                  <Search
                    barcode={configurations.search.barcode}
                    voiceSearch={configurations.search.voiceBasedSearch}
                    isTypeahead={configurations.search.enableTypeaheadSearch}
                    isHydratedSearch={configurations.search.enableHydratedSearch}
                    dataTestSelector="DesktopSearch"
                  />
                </div>
              </div>

              <TopMenu configurations={configurations} permission={permission} />
            </div>
            <div className="flex items-center px-4 py-1 mt-1 navigation uppercase" data-test-selector="divLogoImage">
              <div className="flex items-center order-2 gap-4">
                <Navigation />
                {props.elementLinkPanel}
              </div>
            </div>
          </div>
        ) : (
          <div className="mobile-header no-print">
            <MobileHeader
              permission={permission}
              logoUrl={configurations.logo.url}
              barcode={configurations.search.barcode}
              voiceSearch={configurations.search.voiceBasedSearch}
              isTypeahead={configurations.search.enableTypeaheadSearch}
              isHydratedSearch={configurations.search.enableHydratedSearch}
              dataTestSelector="MobileSearch"
            >
              {props.elementMobileLinkPanel}
            </MobileHeader>
          </div>
        )}
        {props.elementBottom}
      </header>
    </>
  );
}
