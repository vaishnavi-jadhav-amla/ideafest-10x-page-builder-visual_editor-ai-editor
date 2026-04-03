"use client";

import { IPermissions, IUser } from "@znode/types/user";
import { getLocalStorageData, removeLocalStorageData, setLocalStorageData, useTranslationMessages } from "@znode/utils/component";
import { useEffect, useRef, useState } from "react";
import { useProduct, useUser } from "../../../../stores";
import { ACCOUNT } from "@znode/constants/account";
import { APP } from "@znode/constants/app";
import CartCount from "../../../cart/cart-count/CartCount";
import { ChangeLocale } from "../change-locale/ChangeLocale";
import DropMenu from "../drop-menu/DropMenu";
import { DynamicFormTemplate } from "../../../common/dynamic-form-template";
import { IHeaderConfig } from "@znode/types/headers";
import IdleTimeout from "../../../timeout/Timeout";
import { NavLink } from "../../../common/nav-link";
import { SwitchAccount } from "../switch-account/SwitchAccount";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { getSavedUserSessionCallForClient } from "@znode/utils/common";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { userActivityLog } from "../../../../http-request/user-activity-log/user-activity-log";
import { getUserBStoreRoleAccess } from "../../../../http-request/b-stores/user-role-access";
import { Session } from "next-auth";

export function TopMenu(props: { configurations: IHeaderConfig; permission: IPermissions | null }) {
  const { configurations, permission } = props || {};

  const { links } = configurations;
  const loginTranslations = useTranslationMessages("Login");

  const { status }: { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" } = useSession();
  const { user, loadUser, clearUser } = useUser();
  const [session, setSession] = useState<IUser | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const { updateCartCount } = useProduct();

  const pathname = usePathname();

  const clearCartCookie = () => {
    deleteCartCookies();
    updateCartCount(0);
  };

  const logoutHandler = async (redirectToLogin = true) => {
    const loginTimestamp = getLocalStorageData(USER_ACTIVITY_EVENT.LOGIN_TIMESTAMP);
    userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGOUT, userData: user ?? undefined, loginTimestamp });
    removeLocalStorageData(USER_ACTIVITY_EVENT.LOGIN_TIMESTAMP);
    clearCartCookie();
    await signOut({ redirect: false });
    setLocalStorageData("compareProductList", JSON.stringify([]));
    redirectToLogin ? (window.location.href = "/login") : (window.location.href = "/");
  };

  useEffect(() => {
    if (status === "authenticated") {
      const fetchUserSession = async () => {
        const sessionUser = await getSavedUserSessionCallForClient();
        setSession(sessionUser);

        getUserBStoreRoleAccess().then((response) => {
          if (response && !response.hasError && response.bStoresUserRole) {
            setIsOwner(response.bStoresUserRole.isOwner ?? false);
          } else {
            setIsOwner(false);
          }
        });
      };
      fetchUserSession();
    }
  }, [status]);
  useEffect(() => {
    if (status === "unauthenticated") {
      setSession(null);
      clearUser();
      updateCartCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, clearUser]);

  const handleTimeout = async () => {
    if (user && status === "authenticated") {
      await logoutHandler(true);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-start my-0 text-sm lg:flex-row lg:justify-between lg:items-center lg:mt-2 lg:mb-2">
      <IdleTimeout timeout={APP.SESSION_TIMEOUT} onSessionTimeout={handleTimeout} />
      {session?.accountId ? <SwitchAccount session={session} /> : <></>}
      <div className="hidden lg:flex">
        {session ? (
          <div className="px-5 font-semibold border-r-2 border-black xs:hidden lg:flex" data-test-selector="divSignIn">
            <DropMenu
              permission={permission}
              name={session.firstName || ""}
              onLogout={logoutHandler}
              isAdminUser={(session && session.roleName?.toLowerCase() === ACCOUNT.ADMINISTRATOR_ROLE_NAME.toLocaleLowerCase()) || false}
              isAccountActive={session.accountId && session.accountId > 0 ? true : false}
              isOwner={isOwner}
            />
          </div>
        ) : (
          links.signIn.enable && (
            <NavLink
              url={`/login${pathname && pathname !== "/" ? `?returnUrl=${encodeURIComponent(pathname)}` : ""}`}
              className="px-5 font-semibold border-r-2 border-black text-textColor bg-bodyColor"
              dataTestSelector="linkSignIn"
              ariaLabel="Signin link"
            >
              {loginTranslations("signIn")}
            </NavLink>
          )
        )}
      </div>
      <div className="relative text-black" title="Cart">
        <CartCount dataTestSelector={"Desktop"} />
      </div>
    </div>
  );
}

export function WebstoreMenu(props: { configurations: IHeaderConfig }) {
  const { configurations } = props || {};
  const { changeLocale, links } = configurations;

  const menuTranslations = useTranslationMessages("Menu");
  const commonTranslations = useTranslationMessages("Common");

  const [openQuickOrderForm, setOpenQuickOrderForm] = useState(false);

  const quickOrderIconRef = useRef<HTMLDivElement>(null);

  const quickOrderClickHandler = (e: MouseEvent) => {
    if (quickOrderIconRef && quickOrderIconRef.current && quickOrderIconRef.current.contains(e.target as Node)) {
      if (!openQuickOrderForm) setOpenQuickOrderForm(() => true);
    } else {
      setOpenQuickOrderForm(() => false);
    }
  };

  useEffect(() => {
    typeof window !== "undefined" && window.addEventListener("click", (clickEvent) => quickOrderClickHandler(clickEvent));
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("click", (clickEvent) => quickOrderClickHandler(clickEvent));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute top-1 right-4 flex items-center gap-6">
      {links.quickOrder.enable && (
        <div className="relative flex items-center justify-center " ref={quickOrderIconRef}>
          {/* QuickOrder feature is disable*/}
          <div className="font-medium cursor-pointer text-[13px]" data-test-selector="linkQuickOrder">
            {menuTranslations("quickOrder")}
          </div>

          {/* Dropdown that shows on hover */}
          {openQuickOrderForm && (
            <div className="absolute z-20 bg-white border border-gray-200 shadow-md top-10 rounded-cardBorderRadius w-80 ">
              {/* Arrow for the dropdown */}
              <div className="relative flex items-center justify-center">
                <div className="absolute z-0 w-4 h-4 ml-4 rotate-45 bg-white border border-gray-200 -top-2"></div>
              </div>

              {/* Dropdown content */}
              <div className="relative z-20 w-full p-2 bg-white">
                <DynamicFormTemplate
                  defaultRowCount={1}
                  buttonText={menuTranslations("addToCart")}
                  showAddNewField={false}
                  showClearAllButton={false}
                  buttonPosition="bottom"
                  showFieldClearButton={false}
                  onButtonSubmit={() => setOpenQuickOrderForm(false)}
                  showHeading={false}
                  showMultipleItemsButton={true}
                  showFullWidthResult={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <NavLink url={"/order-status"} className="font-medium text-[13px]" dataTestSelector="linkOrderStatus">
        {commonTranslations("trackOrder")}
      </NavLink>
      {changeLocale.enable && (
        <div className="">
          <ChangeLocale />
        </div>
      )}
    </div>
  );
}
