"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct, useUser } from "../../../stores";

import { ACCOUNT } from "@znode/constants/account";
import { ACCOUNT_NAVIGATION_REGEX } from "@znode/constants/regex";
import Heading from "../../common/heading/Heading";
import { IPermissions } from "@znode/types/user";
import Link from "next/link";
import { MY_ACCOUNT_ROUTES } from "@znode/constants/account-navigation";
import { Separator } from "../../common/separator";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { logClient } from "@znode/logger";
import { setLocalStorageData } from "@znode/utils/component";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function AccountNavigation({ permission }: { permission: IPermissions | null }) {
  const pathname = usePathname();
  const t = useTranslations("MyAccount");
  const [openDropdown, setOpenDropDown] = useState(false);
  const [isAdministrator, setIsAdministrator] = useState<boolean>(false);
  const { user, loadUser, isUserSessionLoading } = useUser();

  const { updateCartCount } = useProduct();
  const isNavigationActive = (route: string) => {
    const cleanPathname = pathname.replace(ACCOUNT_NAVIGATION_REGEX.ACCOUNT_MENU_REGEX, "");
    // Extract the base route (first 3 segments)
    const pathSegments = cleanPathname.split("/");
    const baseRoute = pathSegments?.length > 1 ? pathSegments.slice(1).join("/") : "";
    if (baseRoute.includes(route)) {
      return "text-linkColor font-semibold";
    }
    return "";
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isUserSessionLoading && user) {
      setIsAdministrator((user && user.roleName?.toLowerCase() === ACCOUNT.ADMINISTRATOR_ROLE_NAME.toLocaleLowerCase()) || false);
    }
  }, [isUserSessionLoading, user]);

  const clearCartCookie = () => {
    deleteCartCookies();
    updateCartCount(0);
  };

  const logoutHandler = async () => {
    clearCartCookie();
    await signOut({ redirect: false });
    loadUser(true);
    setLocalStorageData("compareProductList", JSON.stringify([]));
    window.location.href = "/login";
  };

  return (
    <>
      <div className="flex items-center justify-between no-print">
        <Heading name={t("myAccount")} dataTestSelector="hdgMyAccount" customClass="max-md:border-transparent" level="h2" />
        <span onClick={() => setOpenDropDown((prev) => !prev)} className="block pl-2 arrow md:hidden" data-test-selector="spnMyAccountDropDown">
          {!openDropdown ? <ChevronDown width="20px" height="20px" /> : <ChevronUp width="20px" height="20px" />}
        </span>
      </div>
      <Separator customClass="mt-0" />

      <div className={`${openDropdown ? "block" : "hidden"} md:block no-print`} data-test-selector="divMyAccount">
        <ul onClick={() => setOpenDropDown(false)}>
          <li className="pb-2 pr-2 text-gray-700">
            <Link href="/account/dashboard" className={isNavigationActive(MY_ACCOUNT_ROUTES.DASHBOARD)} data-test-selector="linkDashboard" prefetch={false}>
              {t("dashboard")}
            </Link>
          </li>
          <li className="py-2 pr-2 text-gray-700">
            <Link href="/account/wishlist" className={isNavigationActive(MY_ACCOUNT_ROUTES.WISHLIST)} data-test-selector="linkWishlist" prefetch={false}>
              {t("wishlist")}
            </Link>
          </li>
          {user?.accountId && user?.accountId > 0 && isAdministrator ? (
            <>
              <li className="pt-2 pb-2 pr-2 text-gray-700">
                <Link href="/account/account-orders" className={isNavigationActive(MY_ACCOUNT_ROUTES.ACCOUNT_ORDERS)} data-test-selector="linkAccountOrders" prefetch={false}>
                  {t("accountOrders")}
                </Link>
              </li>
              <li className="pt-2 pb-2 pr-2 text-gray-700">
                <Link
                  href="/account/account-information"
                  className={isNavigationActive(MY_ACCOUNT_ROUTES.ACCOUNT_INFORMATION)}
                  data-test-selector="linkAccountInformation"
                  prefetch={false}
                >
                  {t("accountInformation")}
                </Link>
              </li>
              <li className="pt-2 pb-2 pr-2 text-gray-700">
                <Link href="/account/account-users" className={isNavigationActive(MY_ACCOUNT_ROUTES.ACCOUNT_USERS)} data-test-selector="linkAccountUsers" prefetch={false}>
                  {t("accountUsers")}
                </Link>
              </li>
            </>
          ) : (
            <></>
          )}
          {permission?.enablePreviousPurchases && (
            <li className="pt-2 pb-2 pr-2 text-gray-700">
              <Link
                href="/account/previous-purchases"
                className={isNavigationActive(MY_ACCOUNT_ROUTES.PREVIOUS_PURCHASE)}
                data-test-selector="linkPreviousPurchases"
                prefetch={false}
              >
                {t("previousPurchases")}
              </Link>
            </li>
          )}
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href="/account/order/list"
              className={isNavigationActive(MY_ACCOUNT_ROUTES.ORDER_HISTORY) || isNavigationActive(MY_ACCOUNT_ROUTES.ORDER_DETAILS)}
              data-test-selector="linkOrderHistory"
              prefetch={false}
            >
              {t("orderHistory")}
            </Link>
          </li>
          {permission?.enableReturnOrderRequest && (
            <li className="pt-2 pb-2 pr-2 text-gray-700">
              <Link href="/account/return-order" className={isNavigationActive(MY_ACCOUNT_ROUTES.RETURN_ORDER)} data-test-selector="linkReturnOrder">
                {t("returnOrder")}
              </Link>
            </li>
          )}

          {/* pendingOrderCount > 0 */}
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href="/account/pending-order/list"
              className={isNavigationActive(MY_ACCOUNT_ROUTES.PENDING_ORDER_HISTORY) || isNavigationActive(MY_ACCOUNT_ROUTES.PENDING_ORDER_DETAILS)}
              data-test-selector="linkPendingOrder"
              prefetch={false}
            >
              {t("pendingOrder")}
            </Link>
          </li>
          {
            <li className="pt-2 pb-2 pr-2 text-gray-700">
              <Link
                href="/account/pending-payment/list"
                className={isNavigationActive(MY_ACCOUNT_ROUTES.PENDING_PAYMENT_HISTORY) || isNavigationActive(MY_ACCOUNT_ROUTES.PENDING_PAYMENT_DETAILS)}
                data-test-selector="linkPendingPayment"
                prefetch={false}
              >
                {t("pendingPayment")}
              </Link>
            </li>
          }
          {permission?.enableQuoteRequest && (
            <li className="pt-2 pb-2 pr-2 text-gray-700">
              <Link
                href="/account/quote/list"
                className={isNavigationActive(MY_ACCOUNT_ROUTES.QUOTE_ORDER) || isNavigationActive(MY_ACCOUNT_ROUTES.QUOTE_DETAILS)}
                data-test-selector="linkQuoteOrder"
                prefetch={false}
              >
                {t("quoteHistory")}
              </Link>
            </li>
          )}

          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href={"/account/voucher/list"}
              className={isNavigationActive(MY_ACCOUNT_ROUTES.VOUCHER_HISTORY) || isNavigationActive(MY_ACCOUNT_ROUTES.VOUCHER_DETAILS)}
              data-test-selector="linkGiftCardHistory"
              prefetch={false}
            >
              {t("voucherHistory")}
            </Link>
          </li>

          {/* TODO : Yet to implement savedCreditCard  and orderTemplates*/}
          {/* <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link href={"/account/saved-card"} className={isNavigationActive(MY_ACCOUNT_ROUTES.SAVE_CREDIT_CARD)} data-test-selector="linkSaveCreditCard">
              {t("savedCreditCard")}
            </Link>
          </li> */}
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href={"/account/order-templates/list"}
              className={isNavigationActive(MY_ACCOUNT_ROUTES.ORDER_TEMPLATES) || isNavigationActive(MY_ACCOUNT_ROUTES.CREATE_ORDER_TEMPLATE)}
              data-test-selector="linkOrderTemplates"
              prefetch={false}
            >
              {t("orderTemplates")}
            </Link>
          </li>
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href={"/account/address-book"}
              className={isNavigationActive(MY_ACCOUNT_ROUTES.ADDRESS_BOOK) || isNavigationActive(MY_ACCOUNT_ROUTES.ADD_EDIT_ADDRESS_BOOK)}
              data-test-selector="linkAddressBook"
              prefetch={false}
            >
              {t("addressBook")}
            </Link>
          </li>
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href={"/account/edit-profile"}
              className={isNavigationActive(MY_ACCOUNT_ROUTES.EDIT_PROFILE) || isNavigationActive(MY_ACCOUNT_ROUTES.CHANGE_PASSWORD)}
              data-test-selector="linkEditProfile"
              prefetch={false}
              aria-label="Edit profile"
            >
              {t("editProfile")}
            </Link>
          </li>
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href={"/account/saved-cart/list"}
              className={isNavigationActive(MY_ACCOUNT_ROUTES.SAVE_CART) || isNavigationActive(MY_ACCOUNT_ROUTES.SAVE_CART_EDIT)}
              data-test-selector="linkSavedCarts"
              prefetch={false}
            >
              {t("savedCarts")}
            </Link>
          </li>
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link href={"/account/review-history"} className={isNavigationActive(MY_ACCOUNT_ROUTES.REVIEW_HISTORY)} data-test-selector="linkReviewHistory" prefetch={false}>
              {t("reviewHistory")}
            </Link>
          </li>
          <li className="pt-2 pb-2 pr-2 text-gray-700">
            <Link
              href="#"
              onClick={() => {
                logClient.info("logout");
                logoutHandler();
              }}
              data-test-selector="linkLogout"
              prefetch={false}
            >
              {t("logout")}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
