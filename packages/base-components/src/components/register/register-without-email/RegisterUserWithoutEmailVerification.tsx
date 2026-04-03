"use client";

import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IMergeCartRequest, IRegisterUserRequest } from "@znode/types/user";
import { clearLocalStorageData, getCookie, setCookie, setLocalStorageData, useTranslationMessages } from "@znode/utils/component";
import { useEffect, useRef, useState } from "react";
import { useModal, useProduct } from "../../../stores";

import { AlreadyHaveAccount } from "../../common/already-have-account/AlreadyHaveAccount";
import Button from "../../common/button/Button";
import { CART_COOKIE } from "@znode/constants/cookie";
import { Heading } from "../../common/heading";
import { HeadingBar } from "../../common/heading-bar/HeadingBar";
import { IGlobalAttributeValues } from "@znode/types/portal";
import { INPUT_REGEX } from "@znode/constants/regex";
import { REG_EX } from "@znode/constants/app";
import { Recaptcha } from "../../common/recaptcha/Recaptcha";
import { ValidationMessage } from "../../common/validation-message";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { getBaseUrl } from "@znode/utils/common";
import { mergeGuestUserCart } from "../../../http-request/cart";
import { registerUserWithoutEmailVerification } from "../../../http-request/account/user/register/without-email-verification/register-user-without-email-verification";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";
import { userActivityLog } from "../../../http-request/user-activity-log/user-activity-log";
import { ISignUpModal } from "../../signup";

export const RegisterUserWithoutEmailVerification: React.FC<{
  isCheckoutAsGuest: boolean;
  attributes?: IGlobalAttributeValues[];
  storeCode: string;
  handleCancel?: () => void;
  onRegistrationComplete?: (_arg: boolean) => void;
  isFromCheckout?: boolean;
  returnUrl?: string;
  setModalData?: React.Dispatch<React.SetStateAction<ISignUpModal>>;
}> = ({ isCheckoutAsGuest, attributes, storeCode, handleCancel, onRegistrationComplete, isFromCheckout = false, returnUrl, setModalData }) => {
  const registerMessages = useTranslationMessages("Register");
  const { error, success } = useToast();
  const reCaptchaRef = useRef(null);
  const router = useRouter();
  const { closeModal } = useModal();

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [reVerify, setReVerify] = useState(false);
  const [formData, setFormData] = useState<IRegisterUserRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState<boolean>(false);
  const [siteKey, setSiteKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>();
  const { updateCartCount } = useProduct();
  const { openModal } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IRegisterUserRequest>({ mode: "onChange" });

  const checkIsRecaptchaEnabled = (attributes: IGlobalAttributeValues[]) => {
    const siteKey = attributes?.find((attribute) => attribute.attributeCode === "SiteKey")?.attributeValue || "false";
    const captchaRequired = attributes?.find((attribute) => attribute.attributeCode === "IsCaptchaRequiredForLogin")?.attributeValue === "true" || false;
    const secretKey = attributes.find((attribute) => attribute.attributeCode === "SecretKey")?.attributeValue || "false";
    setSiteKey(siteKey);
    setCaptchaRequired(captchaRequired);
    setSecretKey(secretKey);
  };

  const mergeCart = async (guestUserCartNumber: string) => {
    const mergeCartRequest: IMergeCartRequest = {
      guestUserCartNumber: guestUserCartNumber,
    };

    const mergeCartResponse = await mergeGuestUserCart(mergeCartRequest);
    updateCartCount(mergeCartResponse.cartCount);
    mergeCartResponse.mergedCartNumber && setCookie(CART_COOKIE.CART_NUMBER, mergeCartResponse.mergedCartNumber);
  };

  useEffect(() => {
    attributes && checkIsRecaptchaEnabled(attributes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes]);

  const handleRecaptchaVerify = async (verified: boolean) => {
    setReVerify(verified);
    if (verified && isFormSubmitted && formData) {
      try {
        setIsLoading(true);
        const newRegisteredUser = await registerUserWithoutEmailVerification(formData);
        if (newRegisteredUser && newRegisteredUser?.status === "success") {
          if (newRegisteredUser && newRegisteredUser.data && newRegisteredUser.data.hasApproval) {
            success(registerMessages("adminApprovalSuccessMessage"));
            setIsLoading(false);
            router.push("/login");
          }
          if (!newRegisteredUser.data?.hasError) {
            const result = await signIn("credentials", {
              redirect: false,
              username: formData.userName,
              password: formData.password,
              storeCode: storeCode,
              multiFactorSignIn: "true",
            });

            if (!result?.error) {
              clearLocalStorageData();
              const guestUserCartNumber = getCookie(CART_COOKIE.CART_NUMBER);
              deleteCartCookies();
              if (guestUserCartNumber) {
                await mergeCart(guestUserCartNumber);
              }
              setLocalStorageData(USER_ACTIVITY_EVENT.LOGIN_TIMESTAMP, new Date().toISOString());
              userActivityLog({ eventName: USER_ACTIVITY_EVENT.LOGIN });
              success(registerMessages("accountCreatedSuccessfully"));
              setIsLoading(false);
              if (isCheckoutAsGuest) {
                onRegistrationComplete && onRegistrationComplete(true);
                handleCancel && handleCancel();
                window.location.href = "/checkout";
              } else {
                window.location.href = returnUrl ? returnUrl : "/";
              }
            }
          } else if (newRegisteredUser.data?.hasError) {
            const defaultStoreName = newRegisteredUser?.data?.errorDetails?.defaultStoreName || "";
            const forgotPasswordURL = newRegisteredUser?.data?.errorDetails?.forgotPasswordUrl || "";
            if (setModalData && defaultStoreName && forgotPasswordURL) {
              setModalData({ showModal: true, errorDetails: { defaultStoreName, forgotPasswordURL } });
              openModal("existingUserModal");
            } else {
              error(newRegisteredUser?.message ?? registerMessages("accountCreatedFailed"));
            }
          }
        } else if (newRegisteredUser?.hasError) {
          error(newRegisteredUser?.message ?? registerMessages("accountCreatedFailed"));
        }
      } catch (error) {
        logServer.error(AREA.WIDGET, errorStack(error));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const callSubmission = () => {
    setIsLoading(true);
    if (captchaRequired && !reVerify) {
      error(registerMessages("verificationError"));
      setIsFormSubmitted(false);
      setIsLoading(false);
      return;
    } else {
      if (captchaRequired) {
        setReVerify(false);
        if (reCaptchaRef.current) {
          //@ts-expect-error recaptcha library types not defined for reset
          reCaptchaRef.current.reset();
          //@ts-expect-error recaptcha library types not defined for reset
          reCaptchaRef.current.execute();
        }
      } else {
        handleRecaptchaVerify(true);
      }
    }
  };

  useEffect(() => {
    isFormSubmitted && formData && callSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormSubmitted, formData]);

  const onSubmit = (registerUserRequest: IRegisterUserRequest) => {
    // TODO should come from request referer
    registerUserRequest.baseUrl = getBaseUrl();
    setFormData(registerUserRequest);
    setIsFormSubmitted(true);
  };

  return (
    <div className="md:m-4 min-[992px]:m-0 lg:m-4 min-[1200px]:m-0">
      <HeadingBar name={registerMessages("createAnAccount")} />
      <div className={`${!isFromCheckout ? "grid-cols-2 gap-16 md:grid lg:gap-32" : "grid-cols-1 md:grid"} mt-6 md:mt-10 md:mb-8`}>
        <div className="col-span-1 mb-10 md:mb-0">
          <Heading name={registerMessages("registerForAccount")} dataTestSelector="hdgRegisterAccount" customClass="text-center uppercase" level="h1" showSeparator />
          <div className="p-0 mt-5 sm:p-0 md:px-5 md:pt-3 md:w-full">
            <form onSubmit={handleSubmit(onSubmit)} method="post">
              <div className="pb-2">
                <label className="font-semibold" htmlFor="userName" data-test-selector="lblEmail">
                  {registerMessages("email")}
                  <strong className="ml-1 text-errorColor">*</strong>
                </label>
                <input
                  className="w-full h-10 px-2 py-1 mt-2 input "
                  {...register("userName", {
                    required: registerMessages("requiredEmailAddress"),
                    pattern: { value: REG_EX.Email, message: registerMessages("emailPatternMessage") },
                  })}
                  aria-label={registerMessages("email")}
                  data-test-selector="txtEmail"
                />
                {errors.userName && <ValidationMessage message={errors.userName.message} dataTestSelector="requiredEmailError" />}
              </div>

              <div className="pb-2">
                <label className="font-semibold" htmlFor="password" data-test-selector="lblPassword">
                  {registerMessages("password")}
                  <strong className="ml-1 text-errorColor">*</strong>
                </label>
                <input
                  type="password"
                  className="w-full h-10 px-2 py-1 mt-2 input "
                  {...register("password", {
                    required: registerMessages("requiredPassword"),
                    pattern: { value: INPUT_REGEX.PASSWORD_REGEX, message: registerMessages("passwordPatternMessage") },
                  })}
                  aria-label={registerMessages("password")}
                  data-test-selector="txtPasswordField"
                />
                {errors.password && <ValidationMessage message={errors.password.message} dataTestSelector="requiredPasswordError" />}
              </div>

              <div className="pb-2">
                <label className="font-semibold" htmlFor="retypePassword" data-test-selector="lblConfirmPassword">
                  {registerMessages("confirmPassword")}
                  <strong className="ml-1 text-errorColor">*</strong>
                </label>
                <input
                  type="password"
                  id="retypePassword"
                  className="w-full h-10 px-2 py-1 mt-2 input "
                  aria-label={registerMessages("confirmPassword")}
                  data-test-selector="txtConfirmPasswordField"
                  {...register("retypePassword", {
                    required: registerMessages("confirmRetypePassword"),
                    validate: (value) => value === watch("password") || registerMessages("errorConfirmPassword"),
                  })}
                />
                {errors.retypePassword && <ValidationMessage message={errors.retypePassword.message} dataTestSelector="requiredConfirmPasswordError" />}
              </div>

              <div className="flex items-center pb-2">
                <input
                  id="signUpOptIn"
                  className="w-full h-4 px-2 py-1 mr-3 border rounded-md cursor-pointer border-inputColor hover:border-gray-300 active:border-gray-300  form-radio xs:w-4 accent-accentColor input"
                  {...register("emailOptIn")}
                  type="checkbox"
                  data-test-selector="chkSignUpOptIn"
                  aria-label={registerMessages("receiveEmailsAndSpecialOffers")}
                />
                <label htmlFor="signUpOptIn" className="font-semibold cursor-pointer" data-test-selector="lblSignUpOptIn">
                  {registerMessages("receiveEmailsAndSpecialOffers")}
                </label>
              </div>

              <div className="items-center mt-3 sm:flex">
                <Button
                  htmlType="submit"
                  type="primary"
                  size="small"
                  dataTestSelector="btnCreateAccount"
                  className="w-full sm:w-auto"
                  ariaLabel={registerMessages("createAccount")}
                  loading={isLoading}
                  showLoadingText={true}
                  loaderColor="currentColor"
                  loaderWidth="20px"
                  loaderHeight="20px"
                >
                  {registerMessages("createAccount")}
                </Button>
                <Button
                  type="secondary"
                  size="small"
                  onClick={() => {
                    if (isCheckoutAsGuest) {
                      closeModal();
                    } else {
                      router.push("/login");
                    }
                  }}
                  dataTestSelector="btnCancel"
                  className="w-full px-5 py-2 mt-3 sm:mt-0 sm:ml-3 sm:w-auto"
                >
                  {registerMessages("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
        <AlreadyHaveAccount isCheckoutAsGuest={isCheckoutAsGuest} headingClass="text-2xl" linkClass="w-full md:w-80 mb-6" />
        {captchaRequired && siteKey && siteKey !== "" && (
          <Recaptcha onVerify={handleRecaptchaVerify} recaptchaRef={reCaptchaRef} siteKey={siteKey} secretKey={secretKey} dataTestSelector="divRegisterRecaptcha" />
        )}{" "}
      </div>
    </div>
  );
};
