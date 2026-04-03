"use client";

import { clearLocalStorageData, deleteCookie } from "@znode/utils/component";
import { getCartCount, getCartNumber } from "../../../http-request/cart";
import { useEffect, useState } from "react";

import { COMMON } from "@znode/constants/common";
import { ImpersonationPopUp } from "../impersonation-popup/ImpersonationPopup";
import LoaderComponent from "../../common/loader-component/LoaderComponent";
import { Modal } from "../../common/modal/Modal";
import { ValidationMessage } from "../../common/validation-message";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { signIn } from "next-auth/react";
import { useModal } from "../../../../../base-components/src/stores/modal";
import { useProduct } from "../../../stores";
import { useTranslations } from "next-intl";

interface IUserImpersonationParams {
  token: string;
  isUserLoggedIn: boolean;
  enableCartRedirection: boolean;
  portalId: number;
}

export const ImpersonationLogin = (impersonationDetails: IUserImpersonationParams) => {
  const { openModal } = useModal();
  const { token, portalId, enableCartRedirection, isUserLoggedIn } = impersonationDetails;
  const [isMounted, setIsMounted] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loginMessages = useTranslations("Impersonation");
  const [domainName, setDomainName] = useState("");
  const { updateCartCount } = useProduct();

  const updateCurrentCartCount = async () => {
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const count = await getCartCount(cartNumber, "ImpersonationLogin");
      if (count) {
        updateCartCount(count);
        return count;
      }
    }
  };

  const loginAsAdmin = async () => {
    try {
      setIsLoading(true);
      if (!isUserLoggedIn) {
        const userData = await signIn("credentials", {
          redirect: false,
          portalId: portalId,
          impersonation: token,
          domainName: domainName,
        });

        if (userData?.error) {
          deleteCookie(COMMON.MAPPING_ID);
          throw new Error(userData.error);
        }
        clearLocalStorageData();
        deleteCartCookies();
        const cartCount = await updateCurrentCartCount();
        if (enableCartRedirection && cartCount && cartCount > 0) {
          window.location.href = "/cart";
          return;
        }
        window.location.href = "/";
      } else {
        openModal("ImpersonationInfoModel");
      }
    } catch (error) {
      setLoginError(loginMessages("loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set the domain name and mount state only on the client side
    if (typeof window !== "undefined") {
      setDomainName(window.location.origin);
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      loginAsAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  if (!isMounted) {
    return <LoaderComponent isLoading={true} width="10px" height="10px" />;
  }

  return (
    <div className="flex justify-center items-center">
      {isLoading && <LoaderComponent isLoading={true} />}
      {loginError && <ValidationMessage message={loginError} dataTestSelector="loginError" customClass="mt-4 text-center text-errorColor" />}
      <Modal size="xl" modalId="ImpersonationInfoModel" maxHeight="lg" customClass="overflow-y-auto">
        <ImpersonationPopUp token={token} portalId={portalId} enableCartRedirection={enableCartRedirection} domainName={domainName} />
      </Modal>
    </div>
  );
};
