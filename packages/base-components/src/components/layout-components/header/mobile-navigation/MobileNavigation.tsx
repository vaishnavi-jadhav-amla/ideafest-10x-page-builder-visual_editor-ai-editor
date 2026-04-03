"use client";

import React, { Dispatch, SetStateAction, useState } from "react";

import Button from "../../../common/button/Button";
import CartCount from "../../../cart/cart-count/CartCount";
import { ChangeLocale } from "../change-locale/ChangeLocale";
import { IPortalLocale } from "@znode/types/portal";
import Link from "next/link";
import { MENU } from "@znode/constants/menu";
import MegaMenu from "../mega-menu/MegaMenu";
import { X } from "lucide-react";
import { ZIcons } from "../../../common/icons";
import { useTranslationMessages } from "@znode/utils/component";

interface mobileNavigationProp {
  setShowNavBar: Dispatch<SetStateAction<boolean>>;
  linkPanelData: React.ReactNode;
  portalLocales: IPortalLocale[];
}

const MobileNavigation = ({ setShowNavBar, linkPanelData: _linkPanelData }: mobileNavigationProp) => {
  const menuTranslations = useTranslationMessages("Menu");
  const commonTranslation = useTranslationMessages("Common");
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  const closeMenu = () => {
    setShowNavBar(false);
  };

  const isMegaMenuShow = () => (showMegaMenu ? setShowMegaMenu(false) : setShowMegaMenu(true));

  const toggleSignIcon = () => (showMegaMenu ? <ZIcons name="minus" strokeWidth={"3px"} /> : <ZIcons name="plus" strokeWidth={"3px"} />);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      isMegaMenuShow();
    }
  };

  return (
    <>
      <div className="flex justify-end close-menu-btn-container">
        <Button type="text" size="small" dataTestSelector="btnCloseMenu" startIcon={<X color="#fff" />} className="close-mobile-menu" onClick={() => closeMenu()}></Button>
      </div>

      <div className="flex items-center justify-between flex-1 py-6 border-b header-icon-container">
        <div className="flex items-end order-1">
          <ChangeLocale isMobile={true} />
        </div>

        <div className="flex items-center order-2">
          <div>
            <Link href={"/order-status"} className="text-sm font-medium text-white pr-5" data-test-selector="linkOrderStatus" onClick={() => closeMenu()}>
              {commonTranslation("trackOrder")}
            </Link>
          </div>

          <div>
            <Link
              href={"/quick-order"}
              className="text-sm font-medium text-white pr-5"
              data-test-selector="linkQuickOrderMobile"
              onClick={() => closeMenu()}
              prefetch={false}
            >
              {menuTranslations("quickOrder")}
            </Link>
          </div>

          <div>
            <Link href={"/account/dashboard"} data-test-selector="linkDashboardPage" onClick={() => closeMenu()}>
              <ZIcons name="circle-user" height={"27px"} width={"27px"} strokeWidth={"1.5px"} />
            </Link>
          </div>
          <div>
            <Link aria-label="Go to cart" aria-labelledby="Go to cart page" href="/cart" data-test-selector="linkCartPage" onClick={() => closeMenu()} prefetch={false}>
              <div className="relative pl-1">
                <CartCount />
              </div>
            </Link>
          </div>
        </div>
      </div>
      <nav className="overflow-auto shop-department-menus scroll-smooth max-h-screen-80">
        <ul className="flex flex-col font-semibold uppercase" data-test-selector="listNavigationContainer">
          <li className="text-white !py-0 !border-b-0" data-test-selector="listShopDepartment">
            <div className="flex justify-between border-b py-3.5" role={"button"} tabIndex={0} onKeyDown={() => handleKeyDown} onClick={() => isMegaMenuShow()}>
              {menuTranslations("shopDepartment")}
              <Button type="text" size="small" dataTestSelector="btnShowHideMenu" startIcon={toggleSignIcon()} />
            </div>
            <MegaMenu type={MENU.MOBILE} isVisible={showMegaMenu} setShowNavBar={setShowNavBar} />
          </li>
          {/* Intentionally omit linkPanelData on mobile header list to avoid duplicate Quick Order entry */}
        </ul>
      </nav>
    </>
  );
};

export default MobileNavigation;
