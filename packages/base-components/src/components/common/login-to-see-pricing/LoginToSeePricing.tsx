"use client";

import { COMMON } from "@znode/constants/common";
import { useTranslations } from "next-intl";
import { useCategoryDetails } from "../../../stores";
import { NavLink } from "../nav-link";

interface ILoginToSeePricing {
  isLoginRequired: boolean;
  isObsolete: string | boolean;
  productUrl: string;
  closeQuickViewModal?: () => void;
}

export function LoginToSeePricing({ isLoginRequired, isObsolete, productUrl, closeQuickViewModal }: ILoginToSeePricing) {
  const { loading, isUserLoggedIn } = useCategoryDetails();
  const productTranslations = useTranslations("Product");

  return (
    isLoginRequired &&
    !isUserLoggedIn &&
    !loading && (
      <>
        <div className="mb-3">
          <p className="heading-4 py-0 mb-0.5">{productTranslations("whatsThePrice")}</p>
          <p className="text-xs">
            <NavLink url="/login" onClick={closeQuickViewModal} className="underline text-linkColor" dataTestSelector="linkLogin" ariaLabel="Signin link">
              {productTranslations("signIn")}
            </NavLink>{" "}
            {productTranslations("or")}{" "}
            <NavLink url="/signup" onClick={closeQuickViewModal} className="underline text-linkColor" dataTestSelector="linkSignup" ariaLabel="Register link">
              {productTranslations("register")}
            </NavLink>{" "}
            {productTranslations("forPricingAndInventory")}
          </p>
        </div>
        {isObsolete === COMMON.TRUE_VALUE && (
          <div className="p-2 text-sm font-semibold bg-gray-100">
            <p className="tracking-wide text-errorColor">
              {productTranslations("obsoleteMsg")}
              <NavLink url={productUrl + "#replacementProducts"} className="border-b-2 border-errorColor" dataTestSelector="linkReplacementProduct" ariaLabel="Replacement link">
                {" "}
                {productTranslations("obsoleteMsgLink")}{" "}
              </NavLink>
              {productTranslations("obsoleteMsgProduct")}
            </p>
          </div>
        )}
      </>
    )
  );
}
