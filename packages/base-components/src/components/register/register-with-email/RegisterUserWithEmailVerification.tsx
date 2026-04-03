"use client";

import { AREA, errorStack, logServer } from "@znode/logger/server";
import React, { useEffect, useRef, useState } from "react";

import { AlreadyHaveAccount } from "../../common/already-have-account/AlreadyHaveAccount";
import Button from "../../common/button/Button";
import { Heading } from "../../common/heading";
import { HeadingBar } from "../../common/heading-bar/HeadingBar";
import { IGlobalAttributeValues } from "@znode/types/portal";
import { IRegisterUserRequest } from "@znode/types/user";
import { REG_EX } from "@znode/constants/app";
import { Recaptcha } from "../../common/recaptcha/Recaptcha";
import { ValidationMessage } from "../../common/validation-message";
import { registerUserWithEmailVerification } from "../../../http-request/account/user/register/with-email-verification/register-user-with-email-verification";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";
import { ISignUpModal } from "../../signup";
import { useModal } from "../../../stores";

export const RegisterUserWithEmailVerification: React.FC<{
  isCheckoutAsGuest: boolean;
  attributes: IGlobalAttributeValues[];
  handleCancel?: () => void;
  onRegistrationComplete?: (_arg: boolean) => void;
  isFromCheckout?: true;
  setModalData?: React.Dispatch<React.SetStateAction<ISignUpModal>>;
}> = ({ isCheckoutAsGuest, attributes, handleCancel, onRegistrationComplete, isFromCheckout, setModalData }) => {
  const registerMessages = useTranslationMessages("Register");
  const signUpMessages = useTranslationMessages("SignUp");
  const commonMessages = useTranslationMessages("Common");
  const router = useRouter();
  const { error, success } = useToast();
  const reCaptchaRef = useRef(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [reVerify, setReVerify] = useState(false);
  const [formData, setFormData] = useState<IRegisterUserRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState<boolean>(false);
  const [siteKey, setSiteKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>();
  const { openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    reset,
  } = useForm<IRegisterUserRequest>();
  const onSubmit = (registerUserRequest: IRegisterUserRequest) => {
    const registrationDetails = {
      emailOptIn: registerUserRequest.emailOptIn || false,
      userName: registerUserRequest.userName,
      baseUrl: new URL(window.location.origin).href.replace(/\/$/, "")!, // TODO should come from request referer
    };

    setFormData(registrationDetails);
    setIsFormSubmitted(true);
  };

  const checkIsRecaptchaEnabled = (attributes: IGlobalAttributeValues[]) => {
    const siteKey = attributes?.find((attribute) => attribute.attributeCode === "SiteKey")?.attributeValue || "false";
    const captchaRequired = attributes?.find((attribute) => attribute.attributeCode === "IsCaptchaRequiredForLogin")?.attributeValue === "true" || false;
    const secretKey = attributes.find((attribute) => attribute.attributeCode === "SecretKey")?.attributeValue || "false";
    setSiteKey(siteKey);
    setCaptchaRequired(captchaRequired);
    setSecretKey(secretKey);
  };

  useEffect(() => {
    attributes && checkIsRecaptchaEnabled(attributes);
  }, [attributes]);

  const handleRecaptchaVerify = async (verified: boolean) => {
    try {
      setReVerify(verified);
      if (isFormSubmitted && formData) {
        setIsLoading(true);
        const newRegisteredUser = await registerUserWithEmailVerification(formData);
        if (newRegisteredUser?.status === "success") {
          if (!newRegisteredUser.data?.hasError) {
            reset();
            if (isCheckoutAsGuest) {
              onRegistrationComplete && onRegistrationComplete(true);
              handleCancel && handleCancel();
              router.push("/checkout");
            } else {
              router.push("/signup");
            }
            success(registerMessages("emailVerificationSuccessMessage"));
          } else {
            const defaultStoreName = newRegisteredUser?.data?.errorDetails?.defaultStoreName || "";
            const forgotPasswordURL = newRegisteredUser?.data?.errorDetails?.forgotPasswordUrl || "";
            if (setModalData && defaultStoreName && forgotPasswordURL) {
              setModalData({ showModal: true, errorDetails: { defaultStoreName, forgotPasswordURL } });
              openModal("existingUserModal");
            } else {
              error(newRegisteredUser?.message ?? registerMessages("accountCreatedFailed"));
            }
          }
        }
      }
    } catch (error) {
      logServer.error(AREA.WIDGET, errorStack(error));
    } finally {
      setIsLoading(false);
    }
  };

  const callSubmission = () => {
    if (captchaRequired && !reVerify) {
      error(registerMessages("verificationError"));
      setIsFormSubmitted(false);
      return;
    } else {
      if (captchaRequired) {
        setReVerify(false);
        if (reCaptchaRef.current) {
          //@ts-expect-error Recaptcha library types not defined for reset
          reCaptchaRef.current.reset();
          //@ts-expect-error Recaptcha library types not defined for execute
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

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setValue("userName", email);
    await trigger("userName");
  };

  return (
    <>
      <HeadingBar name={signUpMessages("createAnAccount")} />
      <div className={`${!isFromCheckout ? "grid-cols-2 gap-16 md:grid lg:gap-32 mb-4" : "grid-cols-1 md:grid"} mt-6 md:mt-10 md:mb-8`}>
        <div className="col-span-1">
          <Heading name={signUpMessages("registerForAccount")} customClass="uppercase text-center" level="h1" showSeparator dataTestSelector="hdgRegisterAccount" />
          <div className="mt-8 lg:px-10">
            <form onSubmit={handleSubmit(onSubmit)} method="post">
              <div className="pb-1">
                <div className="pb-2 required">
                  <label htmlFor="userName" className="font-semibold" data-test-selector="lblUsername">
                    {registerMessages("usernameEmail")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                  <input
                    className="w-full h-10 px-2 py-1 mt-2 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                    {...register("userName", {
                      required: registerMessages("requiredEmailAddress"),
                      pattern: { value: REG_EX.Email, message: registerMessages("emailPatternMessage") },
                    })}
                    onBlur={handleEmailChange}
                    id="userName"
                    data-test-selector="txtUserName"
                  />
                  {errors?.userName && <ValidationMessage message={errors.userName?.message} dataTestSelector="requiredUsernameError" />}
                </div>
              </div>

              <div className="flex items-center pb-2 mb-1">
                <input
                  className="w-full h-4 px-2 py-1 mr-3 border rounded-inputBorderRadius border-inputColor hover:border-gray-300 active:border-gray-300  form-radio xs:w-4 accent-accentColor input"
                  id="sign-up-opt"
                  {...register("emailOptIn")}
                  type="checkbox"
                  data-test-selector="chkSignUpOptIn"
                  aria-label={commonMessages("checkboxInput")}
                />
                <label className="font-semibold cursor-pointer" htmlFor="sign-up-opt" data-test-selector="lblReceivePeriodicEmails">
                  {registerMessages("receiveEmailsAndSpecialOffers")}
                </label>
              </div>

              <div className="items-center sm:flex" data-test-selector="divCreateAccount">
                <Button
                  htmlType="submit"
                  className="w-full mr-3 md:w-auto"
                  type="primary"
                  size="small"
                  value="Create Account"
                  dataTestSelector="btnCreateAccount"
                  loading={isLoading}
                  showLoadingText={true}
                  loaderColor="currentColor"
                  loaderWidth="20px"
                  loaderHeight="20px"
                  ariaLabel={registerMessages("createAccount")}
                >
                  {registerMessages("createAccount")}
                </Button>
                <Button
                  type="secondary"
                  size="small"
                  onClick={() => {
                    if (isCheckoutAsGuest) {
                      window.location.href = "/checkout";
                    } else {
                      window.location.href = "/login";
                    }
                  }}
                  className="w-full mt-2 mr-3 md:w-auto md:mt-0"
                  dataTestSelector="linkCancel"
                  ariaLabel={registerMessages("cancel")}
                >
                  {registerMessages("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
        <AlreadyHaveAccount isCheckoutAsGuest={isCheckoutAsGuest} headingClass="xs:text-2xl" linkClass="xs:px-10" />
        {captchaRequired && siteKey && siteKey !== "" && (
          <Recaptcha onVerify={handleRecaptchaVerify} recaptchaRef={reCaptchaRef} siteKey={siteKey} secretKey={secretKey} dataTestSelector="divRegisterRecaptcha" />
        )}
      </div>
    </>
  );
};
