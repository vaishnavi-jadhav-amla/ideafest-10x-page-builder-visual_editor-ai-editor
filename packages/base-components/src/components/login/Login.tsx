"use client";

import { CART_COOKIE, REMEMBER_ME_COOKIE, MULTI_FACTOR_AUTHENTICATION } from "@znode/constants/cookie";
import { ILoginUser, IMergeCartRequest, IUser } from "@znode/types/user";
import { clearLocalStorageData, deleteCookie, getCookie, setCookie, setLocalStorageData } from "@znode/utils/component";
import { getCartCount, getCartNumber, mergeGuestUserCart } from "../../http-request/cart";
import { useEffect, useRef, useState } from "react";
import { useProduct, useCategoryDetails } from "../../stores";

import { ACCOUNT } from "@znode/constants/account";
import Button from "../common/button/Button";
import CheckOutGuestButton from "./CheckOutGuestButton";
import { Heading } from "../common/heading";
import { ILoginRecaptcha } from "@znode/types/common";
import Link from "next/link";
import NewAccountSection from "./NewAccountSection";
import { REG_EX } from "@znode/constants/app";
import { Recaptcha } from "../common/recaptcha";
import { Tooltip } from "../common/tooltip";
import { ValidationMessage } from "../../components/common/validation-message";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "../../stores/toast";
import { useTranslations } from "next-intl";
import { userActivityLog } from "../../http-request/user-activity-log/user-activity-log";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";
import { USER_REGEX } from "@znode/constants/regex";
import { userLogin } from "../../http-request";

export const Login = ({
  storeCode,
  returnUrl,
  isLoginRequired,
  enableCartRedirection,
  redirectURL,
  recaptchaDetails,
  isMultiFactorAuthenticationEnabled,
}: {
  storeCode: string;
  returnUrl: string;
  isLoginRequired: boolean | undefined;
  enableCartRedirection: boolean;
  redirectURL: string;
  recaptchaDetails?: ILoginRecaptcha;
  isMultiFactorAuthenticationEnabled?: boolean;
}) => {
  const { error } = useToast();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reVerify, setReVerify] = useState(false);
  const [loginForm, setLoginForm] = useState<IUser | null>();
  const reCaptchaRef = useRef(null);
  const loginMessages = useTranslations("Login");
  const commonMessages = useTranslations("Common");
  const { updateCartCount, product } = useProduct();
  const { fetchCategories } = useCategoryDetails();
  const { secretKey, siteKey, isCaptchaRequiredForLogin } = recaptchaDetails || {};
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

  const handleRecaptchaVerify = async (verified: boolean) => {
    setReVerify(verified);
  };

  const mergeCart = async (guestUserCartNumber: string) => {
    const mergeCartRequest: IMergeCartRequest = {
      guestUserCartNumber: guestUserCartNumber,
    };

    const mergeCartResponse = await mergeGuestUserCart(mergeCartRequest);
    updateCartCount(mergeCartResponse.cartCount);
    mergeCartResponse.mergedCartNumber && setCookie(CART_COOKIE.CART_NUMBER, mergeCartResponse.mergedCartNumber);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<IUser>();

  useEffect(() => {
    router && router.prefetch("/");
    loginCookieHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setValue]);

  const loginCookieHandler = () => {
    const loginCookie = getCookie(REMEMBER_ME_COOKIE.COOKIE_KEY);
    if (loginCookie) {
      setValue("email", loginCookie);
      setValue("rememberMe", true);
    }
  };

  useEffect(() => {
    const subscription = watch(() => {
      if (loginError) {
        setLoginError("");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, loginError]);

  const login = async (loginRequest: IUser) => {
    try {
      let result = null;
      if (isMultiFactorAuthenticationEnabled) {
        const response: ILoginUser = await userLogin({ username: loginRequest.email || "", password: loginRequest.password || "" });
        if (response.hasError) {
          const errorMessage = response?.errorMessage?.toLowerCase() ?? "";
          const isUserDoesNotExist = USER_REGEX.USER_NOT_EXIST_REGEX.test(errorMessage);
          setLoginError(response.errorMessage || "");
          !isUserDoesNotExist &&
            userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGIN_FAILED, activityError: response?.errorMessage, userData: { userName: loginRequest?.email } });
          return;
        } else if (response.isMultiFactorAuthenticationEnabled) {
          const loginCookie = getCookie(REMEMBER_ME_COOKIE.COOKIE_KEY);
          if (loginRequest && loginRequest.rememberMe) setCookie(REMEMBER_ME_COOKIE.COOKIE_KEY, (loginRequest && loginRequest.email) || "", REMEMBER_ME_COOKIE.COOKIE_EXP);
          else if (loginCookie && loginCookie === loginRequest.email) {
            deleteCookie(REMEMBER_ME_COOKIE.COOKIE_KEY);
          }
          setCookie(MULTI_FACTOR_AUTHENTICATION.OTP_SENT_FLAG, "true");
          setLocalStorageData("hideRemainingAttemptsFlag", "true");
          router.push("/multi-factor-authentication");
          return;
        } else {
          const defaultUser = JSON.stringify(response || {});
          result = await signIn("credentials", {
            redirect: false,
            multiFactorSignIn: "true",
            defaultUser: defaultUser,
          });
        }
      }
      if (result === null) {
        result = await signIn("credentials", {
          redirect: false,
          username: loginRequest.email,
          password: loginRequest.password,
          storeCode: storeCode,
          multiFactorSignIn: "true",
        });
      }
      if (result?.error) {
        const errorMessage = result?.error?.toLowerCase() ?? "";
        const isUserDoesNotExist = USER_REGEX.USER_NOT_EXIST_REGEX.test(errorMessage);
        setLoginError(result.error);
        !isUserDoesNotExist && userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGIN_FAILED, activityError: result?.error, userData: { userName: loginRequest?.email } });
      } else {
        clearLocalStorageData();
        //this call is used for fetching profile based catalog
        fetchCategories();
        const guestUserCartNumber = getCookie(CART_COOKIE.CART_NUMBER);
        deleteCartCookies();
        const loginCookie = getCookie(REMEMBER_ME_COOKIE.COOKIE_KEY);
        if (loginRequest && loginRequest.rememberMe) setCookie(REMEMBER_ME_COOKIE.COOKIE_KEY, (loginRequest && loginRequest.email) || "", REMEMBER_ME_COOKIE.COOKIE_EXP);
        else if (loginCookie && loginCookie === loginRequest.email) {
          deleteCookie(REMEMBER_ME_COOKIE.COOKIE_KEY);
        }
        setLocalStorageData(USER_ACTIVITY_EVENT.LOGIN_TIMESTAMP, new Date().toISOString());
        userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGIN });
        if (guestUserCartNumber) {
          await mergeCart(guestUserCartNumber);
          if (enableCartRedirection) {
            window.location.href = "/cart";
            return;
          }
        } else {
          const cartCount = await updateCurrentCartCount();
          if (enableCartRedirection && cartCount && cartCount > 0) {
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
    } catch (error) {
      setLoginError(loginMessages("loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loginForm && reVerify && login(loginForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginForm, reVerify]);

  const onSubmit = async (loginRequest: IUser) => {
    const email = loginRequest?.email?.trim();
    const password = loginRequest?.password?.trim();

    if (!email || !password) {
      setLoginError(loginMessages("required"));
      setLoginForm(null);
      return;
    }
    setLoginForm(loginRequest);
    setIsLoading(true);
    if (!reVerify && isCaptchaRequiredForLogin) {
      setLoginForm(null);
      error(commonMessages("captchaVerificationError"));
      setIsLoading(false);
      return;
    } else {
      if (isCaptchaRequiredForLogin) {
        setReVerify(false);
        //@ts-expect-error recaptcha library types not defined for reset
        reCaptchaRef && reCaptchaRef?.current && reCaptchaRef.current.reset();
        //@ts-expect-error recaptcha library types not defined for reset
        reCaptchaRef && reCaptchaRef?.current && reCaptchaRef.current.execute();
      } else {
        handleRecaptchaVerify(true);
      }
    }
  };

  const handlePasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setValue("password", password);
    await trigger("password");
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const email = inputValue.replace(/\s+/g, "");
    setValue("email", email);
    await trigger("email");
  };

  return (
    <div className="my-8 md:grid md:grid-cols-2 md:gap-40 lg:gap-48 md:px-2">
      <div className="col-span-1 mb-10 md:mb-0">
        <Heading name={loginMessages("signIn")} customClass="text-center uppercase" level="h1" dataTestSelector="hdgSignIn" showSeparator />
        <div className="lg:px-8">
          <form onSubmit={handleSubmit(onSubmit)} method="post">
            <div className="pb-2 rounded-inputBorderRadius">
              <label className="pb-2 font-semibold" data-test-selector="lblEmail">
                {loginMessages("email")}
              </label>
              <input
                data-test-selector="txtUsername"
                className="w-full h-10 px-2 py-1 mt-2 input"
                {...register("email", {
                  required: loginMessages("requiredEmailAddress"),
                  pattern: { value: REG_EX.Email, message: loginMessages("emailPatternMessage") },
                })}
                name={"email"}
                aria-label={loginMessages("email")}
                onBlur={handleEmailChange}
              />
              {errors?.email && <ValidationMessage message={errors?.email?.message} dataTestSelector="requiredEmailError" />}
            </div>

            <div className="pb-2 rounded-inputBorderRadius">
              <label className="pb-2 font-semibold" data-test-selector="lblPassword">
                {loginMessages("password")}
              </label>
              <input
                data-test-selector="txtPassword"
                type="password"
                className="w-full h-10 px-2 py-1 mt-2 input "
                {...register("password", {
                  required: loginMessages("requiredPassword"),
                })}
                aria-label={loginMessages("password")}
                name={"password"}
                onBlur={handlePasswordChange}
              />
              {errors?.password && <ValidationMessage message={errors?.password?.message} dataTestSelector="requiredPasswordError" />}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center py-2">
                <input
                  id="sign-up-opt-in"
                  className="w-full h-4 px-2 py-1 mr-3 border border-gray-300 rounded-md cursor-pointer hover:border-gray-300 active:border-gray-300  form-radio xs:w-4 accent-accentColor input"
                  {...register("rememberMe")}
                  name={"rememberMe"}
                  data-test-selector="chkSignUpOptIn"
                  type="checkbox"
                  aria-label={loginMessages("rememberMe")}
                />
                <label htmlFor="sign-up-opt-in" className="font-semibold cursor-pointer" data-test-selector="lblRememberMe">
                  {loginMessages("rememberMe")}
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-linkColor hover:text-hoverColor underline" data-test-selector="linkForgotYourPassword" prefetch={false}>
                {loginMessages("forgotYourPassword")}
              </Link>
            </div>

            {loginError && <ValidationMessage message={loginError} dataTestSelector="loginError" customClass="mt-2 text-left text-errorColor" />}

            <div className="flex justify-center mt-6" data-test-selector="divSignIn">
              <Button
                htmlType="submit"
                className="w-full md:w-80"
                type="primary"
                size="small"
                value="Sign In"
                dataTestSelector="btnSignIn"
                loading={isLoading}
                showLoadingText={true}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
                ariaLabel={loginMessages("signIn")}
              >
                <Tooltip message={loginMessages("signIn")}>
                  <span className="uppercase">{loginMessages("signIn")}</span>
                </Tooltip>
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="mb-2">
        <NewAccountSection />
        {!isLoginRequired && (product?.cartCount > 0 || returnUrl === ACCOUNT.CHECKOUT) && <CheckOutGuestButton />}
      </div>
      {isCaptchaRequiredForLogin && siteKey && siteKey !== "" && (
        <Recaptcha onVerify={handleRecaptchaVerify} recaptchaRef={reCaptchaRef} siteKey={siteKey} secretKey={secretKey} dataTestSelector="divLoginRecaptcha" />
      )}{" "}
    </div>
  );
};
