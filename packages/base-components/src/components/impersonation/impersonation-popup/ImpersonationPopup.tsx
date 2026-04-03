"use client";

import { clearLocalStorageData, setCookie } from "@znode/utils/component";
import { getCartCount, getCartNumber } from "../../../http-request/cart";

import Button from "../../common/button/Button";
import { COMMON } from "@znode/constants/common";
import { ValidationMessage } from "../../common/validation-message";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { impersonationLogin } from "../../../http-request";
import { signIn } from "next-auth/react";
import { useModal } from "../../../stores/modal";
import { useProduct } from "../../../stores";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface IPopUp {
  token: string;
  domainName: string;
  portalId: number;
  enableCartRedirection: boolean;
}

export const ImpersonationPopUp = ({ token, portalId, enableCartRedirection, domainName }: IPopUp) => {
  const [loginError, setLoginError] = useState<string>("");
  const loginMessages = useTranslations("Impersonation");
  const { closeModal } = useModal();
  const { updateCartCount } = useProduct();
  const [loading, setIsLoading] = useState<boolean>(false);

  const updateCurrentCartCount = async () => {
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const count = await getCartCount(cartNumber, "ImpersonationPopUp");
      if (count) {
        updateCartCount(count);
        return count;
      }
    }
  };

  const handleRemoveImpersonatedUserSession = async () => {
    try {
      setIsLoading(true);
      const userData = await signIn("credentials", {
        redirect: false,
        portalId: portalId,
        impersonation: token,
        domainName: domainName,
      });
      if (userData?.error) {
        setIsLoading(false);
        throw new Error(userData.error);
      }
      closeModal();
      clearLocalStorageData();
      deleteCartCookies();
      const cartCount = await updateCurrentCartCount();
      if (enableCartRedirection && cartCount && cartCount > 0) {
        window.location.href = "/cart";
        return;
      }
      return (window.location.href = "/");
    } catch (error) {
      setLoginError(loginMessages("loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    closeModal();
    const userDetails = await impersonationLogin({ token: token, domainName: domainName });
    const userCrsName = userDetails?.crsName as string;
    setCookie(COMMON.CRS_USERNAME, userCrsName);
    return (window.location.href = "/");
  };

  return (
    <div className="modal block" role="dialog" aria-labelledby="modalImpersonation" aria-hidden="true" data-test-selector="divConfirmImpersonationContainer">
      <div className="modal-dialog" role="document">
        <div className="rounded-0 ">
          <h4 className="text-left py-3 border-b-2 border-gray-400 text-xl font-semibold uppercase mb-3" data-test-selector="hdgConfirmImpersonation">
            {loginMessages("confirmImpersonation")}
          </h4>
          <div className="mb-3 pl-1">
            <p data-test-selector="<paraConfirmIm>personation">{loginMessages("textConfirmImpersonation")}</p>
          </div>
          <div className="flex justify-end">
            <Button
              type="primary"
              size="small"
              className="mr-5 px-7"
              onClick={handleRemoveImpersonatedUserSession}
              dataTestSelector={"linkButtonOk"}
              loading={loading}
              loaderColor="currentColor"
              loaderHeight="20px"
              loaderWidth="20px"
            >
              {loginMessages("ok")}
            </Button>
            <Button type="secondary" size="small" className="px-7" data-toggle="modal" data-target="#modalSaveCart" dataTestSelector={"linkButtonCancel"} onClick={handleCancel}>
              {loginMessages("cancel")}
            </Button>
          </div>
          {loginError && <ValidationMessage message={loginError} dataTestSelector="loginError" customClass="mt-4 text-center text-errorColor" />}
        </div>
      </div>
    </div>
  );
};
