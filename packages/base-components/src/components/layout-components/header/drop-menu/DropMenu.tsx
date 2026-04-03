"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useProduct, useUser } from "../../../../stores";

import Button from "../../../common/button/Button";
import { IPermissions } from "@znode/types/user";
import Link from "next/link";
import { MY_ACCOUNT_ROUTES } from "@znode/constants/account-navigation";
import { SETTINGS } from "@znode/constants/settings";
import { ZIcons } from "../../../common/icons";
import { formatTestSelector } from "@znode/utils/common";
import { usePathname } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";
import { manageBStore } from "../../../../http-request/b-stores/manage/manage";
import { logClient } from "@znode/logger";

interface DropMenuProps {
  name?: string;
  onLogout: () => void;
  isAdminUser?: boolean;
  isEnableReturnRequest?: boolean;
  mobileView?: boolean;
  isAccountActive?: boolean;
  permission: IPermissions | null;
  isOwner?: boolean;
}

const DropMenu: React.FC<DropMenuProps> = ({ name, onLogout, mobileView = false, isAdminUser = false, isAccountActive = false, permission, isOwner = false }) => {
  const dropDownTranslations = useTranslationMessages("DropDown");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { clearUser } = useUser();
  const { updateCartCount } = useProduct();
  const pathname = usePathname();

  // Toggle dropdown menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    clearUser();
    updateCartCount(0);
    onLogout();
    setIsMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLogout]);

  // Check if the route is active
  const isNavigationActive = useCallback(
    (route: string) => {
      // Remove the language prefix (e.g., /en/) This will handle language codes like /en/
      const cleanPathname = pathname.replace(/^\/[a-z]{2}\//, "");
      const pathSegments = cleanPathname.split("/");
      const routeSegments = route.split("/");
      const segmentCount = routeSegments.length;
      const baseRoute = pathSegments.slice(0, segmentCount).join("/");
      if (baseRoute === route) {
        return "text-linkColor font-semibold";
      }
      return "";
    },
    [pathname]
  );

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Close the menu after navigating to a link
  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu after the link is clicked
  };

  const handleManageBStoreClick = async () => {
    try {
      const response = await manageBStore();

      const data = typeof response === "string" ? JSON.parse(response) : response;

      if (!data.hasError && data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      logClient.error("Error fetching impersonation URL for BStore.", String(error));
    }
  };

  // Define menu items
  const menuItems = [
    { label: dropDownTranslations("dashboard"), route: MY_ACCOUNT_ROUTES.DASHBOARD },
    { label: dropDownTranslations("wishlist"), route: MY_ACCOUNT_ROUTES.WISHLIST },
    { label: dropDownTranslations("accountOrders"), route: MY_ACCOUNT_ROUTES.ACCOUNT_ORDERS, adminOnly: true, isAccountActive: true },
    { label: dropDownTranslations("accountInformation"), route: MY_ACCOUNT_ROUTES.ACCOUNT_INFORMATION, adminOnly: true, isAccountActive: true },
    { label: dropDownTranslations("accountUsers"), route: MY_ACCOUNT_ROUTES.ACCOUNT_USERS, adminOnly: true, isAccountActive: true },
    { label: dropDownTranslations("addressBook"), route: MY_ACCOUNT_ROUTES.ADDRESS_BOOK },
    { label: dropDownTranslations("previousPurchases"), route: MY_ACCOUNT_ROUTES.PREVIOUS_PURCHASE, isEnabled: permission?.enablePreviousPurchases },
    { label: dropDownTranslations("orderHistory"), route: MY_ACCOUNT_ROUTES.ORDER_HISTORY },
    { label: dropDownTranslations("returnOrder"), route: MY_ACCOUNT_ROUTES.RETURN_ORDER, isEnabled: permission?.enableReturnOrderRequest },
    { label: dropDownTranslations("pendingOrder"), route: MY_ACCOUNT_ROUTES.PENDING_ORDER_HISTORY },
    { label: dropDownTranslations("pendingPayment"), route: MY_ACCOUNT_ROUTES.PENDING_PAYMENT_HISTORY },
    { label: dropDownTranslations("quoteHistory"), route: MY_ACCOUNT_ROUTES.QUOTE_ORDER, isEnabled: permission?.enableQuoteRequest },
    { label: dropDownTranslations("orderTemplates"), route: MY_ACCOUNT_ROUTES.ORDER_TEMPLATES },
    { label: dropDownTranslations("voucherHistory"), route: MY_ACCOUNT_ROUTES.VOUCHER_HISTORY },
    { label: dropDownTranslations("editProfile"), route: MY_ACCOUNT_ROUTES.EDIT_PROFILE },
    { label: dropDownTranslations("savedCarts"), route: MY_ACCOUNT_ROUTES.SAVE_CART },
    { label: dropDownTranslations("reviewHistory"), route: MY_ACCOUNT_ROUTES.REVIEW_HISTORY },
    isOwner
      ? { label: dropDownTranslations("manage-b-Store"), customAction: handleManageBStoreClick }
      : { label: dropDownTranslations("b-store-registration"), route: MY_ACCOUNT_ROUTES.B_STORE_REGISTRATION },
  ];

  // Filter menu items based on isAdminUser and isAccountActive
  const filteredMenuItems = menuItems.filter((item) => (!item.adminOnly || (isAdminUser && isAccountActive === true)) && item.isEnabled !== false);

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center justify-between cursor-pointer" onClick={toggleMenu}>
        {mobileView ? (
          <ZIcons name="circle-user" height={"27px"} width={"27px"} strokeWidth={"1.5px"} data-test-selector="svgMobileViewUser" />
        ) : (
          <>
            <label className="text-sm" data-test-selector="lblUserName">
              {dropDownTranslations("hello")}, {name}
            </label>
            <ZIcons name="chevron-down" className="ml-1.5" color={`${SETTINGS.ARROW_COLOR}`} data-test-selector="svgMenuListDropDown" />
          </>
        )}
      </div>

      {isMenuOpen && (
        <div className="absolute z-20 bg-white border border-gray-200 shadow-md top-10 -right-5 rounded-cardBorderRadius max-w-max w-max">
          <div className="absolute z-0 w-4 h-4 rotate-45 bg-white border border-gray-200 -top-2 right-6"></div>
          <ul className="min-w-max max-h-[50vh] h-72 overflow-x-hidden overflow-y-auto custom-scroll w-max relative z-20 bg-white">
            {filteredMenuItems.map((item) => (
              <li
                key={item.label}
                className={`py-2 px-4 cursor-pointer hover:bg-gray-100 ${item.route ? isNavigationActive(item.route) : ""}`}
                data-test-selector={formatTestSelector("list", `${item.label}`)}
                onClick={() => {
                  if (item.customAction) {
                    item.customAction();
                    setIsMenuOpen(false);
                  }
                }}
              >
                {item.route ? (
                  <Link href={`/${item.route}`} className="block w-full h-full" onClick={handleLinkClick} prefetch={false}>
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            ))}
          </ul>
          <div className="mx-4 my-3">
            <Button type="secondary" size="small" className="xs:py-1.5 px-4 capitalize" onClick={handleLogout} dataTestSelector="btnLogout">
              {dropDownTranslations("logout")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DropMenu);
