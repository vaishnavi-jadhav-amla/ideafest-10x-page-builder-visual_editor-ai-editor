"use client";
import { signIn } from "next-auth/react";
import MultiFactorAuthentication from "./MultiFactorAuthentication";
import { validateMultiFactorAuthentication, generateMultiFactorAuthentication, oneTimePasswordDetails, getCartCount, mergeGuestUserCart } from "../../http-request";
import {
  clearLocalStorageData,
  deleteCookie,
  getCookie,
  getLocalStorageData,
  maskEmail,
  removeLocalStorageData,
  setCookie,
  setLocalStorageData,
  signInCleanUpFunction,
  useTranslationMessages,
} from "@znode/utils/component";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CART_COOKIE, MULTI_FACTOR_AUTHENTICATION } from "@znode/constants/cookie";
import { LoaderComponent } from "../common/loader-component";
import { IMergeCartRequest, IMultiFactorAuthenticationResponse } from "@znode/types/user";
import { USER_REGEX } from "@znode/constants/regex";
import { userActivityLog } from "../../http-request/user-activity-log/user-activity-log";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { useCategoryDetails, useProduct, useToast } from "../../stores";
import { getCartNumber } from "../../http-request/cart/get-cart-number";
import { useRouter } from "next/navigation";
import { Logo } from "../layout-components/header/logo";
type Props = {
  username: string;
  title?: string;
  subTitle?: string;
  authenticationUrl?: string;
  resendUrl?: string;
  userId?: number;
  errorMessage?: string;
  redirectURL?: string;
  hasError?: string; // true = error, false = success
  password?: string;
};

const MultiFactorAuthRenderer: React.FC<Props> = ({ username, password, userId, redirectURL }) => {
  const authenticationTranslations = useTranslationMessages("MultiFactorAuthentication");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const otpDetailsRef = useRef<IMultiFactorAuthenticationResponse>({});
  const { updateCartCount } = useProduct();
  const { fetchCategories } = useCategoryDetails();
  const { error, success, warning } = useToast();
  const router = useRouter();

  const stringTranslations = useMemo(() => {
    return {
      timeOutError: authenticationTranslations("timeOutError"),
      enterAuthCode: authenticationTranslations("enterAuthCode"),
      attemptsLeft: authenticationTranslations("attemptsLeft"),
      timeRemaining: authenticationTranslations("timeRemaining"),
      rememberThisDevice: authenticationTranslations("rememberThisDevice"),
      submitCode: authenticationTranslations("submitCode"),
      resendNewCodeInfo: authenticationTranslations("resendNewCodeInfo"),
      resendNewCode: authenticationTranslations("resendNewCode"),
      otpResentSuccessfully: authenticationTranslations("otpResentSuccessfully"),
      invalidOtpCodeSingular: authenticationTranslations("invalidOtpCodeSingular"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const invalidOtpCodePluralTranslations = (remainingAttempts: number) => authenticationTranslations("invalidOtpCodePlural", { remainingAttempts: remainingAttempts });

  const updateCurrentCartCount = async () => {
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const count = await getCartCount(cartNumber, "Login");
      if (count) {
        updateCartCount(count);
        return count;
      }
    }
  };

  const mergeCart = async (guestUserCartNumber: string) => {
    const mergeCartRequest: IMergeCartRequest = {
      guestUserCartNumber: guestUserCartNumber,
    };

    const mergeCartResponse = await mergeGuestUserCart(mergeCartRequest);
    updateCartCount(mergeCartResponse.cartCount);
    mergeCartResponse.mergedCartNumber && setCookie(CART_COOKIE.CART_NUMBER, mergeCartResponse.mergedCartNumber);
  };

  const multiFactorSignIn = useCallback(async () => {
    const result = await signIn("credentials", {
      redirect: false,
      username: username,
      password: password,
      storeCode: otpDetailsRef.current.storeCode || "",
      multiFactorSignIn: "true",
    });
    if (result?.error) {
      const errorMessage = result?.error?.toLowerCase() ?? "";
      const isUserDoesNotExist = USER_REGEX.USER_NOT_EXIST_REGEX.test(errorMessage);
      setMessage(result?.error);
      !isUserDoesNotExist && userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGIN_FAILED, activityError: result?.error, userData: { userName: username } });
    } else {
      clearLocalStorageData();
      //this call is used for fetching profile based catalog
      fetchCategories();
      const guestUserCartNumber = getCookie(CART_COOKIE.CART_NUMBER);
      deleteCartCookies();
      setLocalStorageData(USER_ACTIVITY_EVENT.LOGIN_TIMESTAMP, new Date().toISOString());
      userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGIN });
      if (guestUserCartNumber) {
        await mergeCart(guestUserCartNumber);
        if (otpDetailsRef.current.enableCartRedirection) {
          window.location.href = "/cart";
          return;
        }
      } else {
        const cartCount = await updateCurrentCartCount();
        if (otpDetailsRef.current.enableCartRedirection && cartCount && cartCount > 0) {
          window.location.href = "/cart";
          return;
        }
      }
      if (redirectURL) {
        window.location.href = redirectURL;
        return;
      }
      window.location.href = "/";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const response = await oneTimePasswordDetails(userId || 0);
    const hideRemainingAttemptsFlag = getLocalStorageData("hideRemainingAttemptsFlag");
    if (!response.hasError) {
      otpDetailsRef.current = { ...response, hideRemainingAttemptsFlag: hideRemainingAttemptsFlag ? true : false };
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    const showNotification = getCookie(MULTI_FACTOR_AUTHENTICATION.OTP_SENT_FLAG);
    if (showNotification === "true") {
      setMessage("OTP sent successfully");
      deleteCookie(MULTI_FACTOR_AUTHENTICATION.OTP_SENT_FLAG);
      success(authenticationTranslations("otpSentSuccessfully"));
    }
    fetchData();
    return () => {
      signInCleanUpFunction();
      removeLocalStorageData("hideRemainingAttemptsFlag");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading)
    return (
      <div className=" h-[70vh] w-full">
        <LoaderComponent isLoading={isLoading} />
      </div>
    );

  const triggerNotification = (type: boolean, message: string) => {
    if (type === true) error(message);
    else if (type === false) success(message);
    else warning(message);
  };

  return (
    <div>
      <MultiFactorAuthentication
        logoUrl={otpDetailsRef.current.logoUrl || ""}
        remainingSeconds={otpDetailsRef.current.remainingSeconds || 0}
        remainingAttempts={otpDetailsRef.current.remainingAttempts || 0}
        otpGenerationTime={otpDetailsRef.current.otpGenerationTime || undefined}
        username={username}
        maskedEmail={maskEmail(username || "")}
        userId={userId}
        redirectURL={redirectURL}
        isWebstore={true}
        errorMessage={message}
        hasError={message ? false : true}
        multiFactorSignIn={multiFactorSignIn}
        validateMultiFactorAuthentication={validateMultiFactorAuthentication}
        generateMultiFactorAuthentication={generateMultiFactorAuthentication}
        CustomImageComponent={Logo}
        title={authenticationTranslations("title")}
        subTitle={authenticationTranslations("subTitle")}
        fetchOTPDetails={fetchData}
        redirectToLogin={redirectToLogin}
        triggerNotification={triggerNotification}
        stringTranslations={stringTranslations}
        invalidOtpCodePluralTranslations={invalidOtpCodePluralTranslations}
        hideRemainingAttemptsFlag={otpDetailsRef?.current?.hideRemainingAttemptsFlag || false}
        removeLocalStorageData={removeLocalStorageData}
      />
    </div>
  );
};
export default MultiFactorAuthRenderer;
