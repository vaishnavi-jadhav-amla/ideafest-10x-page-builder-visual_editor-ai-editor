"use client";

import { AREA, errorStack, logServer } from "@znode/logger/server";
import { useEffect, useRef, useState } from "react";

import { AlreadyHaveAccount } from "../../common/already-have-account/AlreadyHaveAccount";
import Button from "../../common/button/Button";
import { ERROR_CODE } from "@znode/constants/error";
import { Heading } from "../../common/heading";
import { IGlobalAttributeValues } from "@znode/types/portal";
import { IRegisterUserRequest } from "@znode/types/user";
import { REG_EX } from "@znode/constants/app";
import { Recaptcha } from "../../common/recaptcha/Recaptcha";
import { ValidationMessage } from "../../common/validation-message";
import { registerUserWithoutEmailVerification } from "../../../http-request/account/user/register/without-email-verification/register-user-without-email-verification";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

export const RegisterUserWithoutEmailVerification: React.FC<{
  isCheckoutAsGuest: boolean;
  attributes?: IGlobalAttributeValues[];
  storeCode: string;
  handleCancel?: () => void;
  onRegistrationComplete?: (_arg: boolean) => void;
  isFromCheckout?: boolean;
}> = ({ isCheckoutAsGuest, attributes, storeCode, handleCancel, onRegistrationComplete, isFromCheckout = false }) => {
  const registerMessages = useTranslationMessages("Register");
  const { error, success } = useToast();
  const reCaptchaRef = useRef(null);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [reVerify, setReVerify] = useState(false);
  const [formData, setFormData] = useState<IRegisterUserRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState<string>("false");
  const [siteKey, setSiteKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IRegisterUserRequest>();

  const checkIsRecaptchaEnabled = (attributes: IGlobalAttributeValues[]) => {
    const siteKey = attributes?.find((attribute: IGlobalAttributeValues) => attribute.attributeCode === "SiteKey")?.attributeValue;
    const captchaRequired = attributes?.find((attribute: IGlobalAttributeValues) => attribute.attributeCode === "IsCaptchaRequiredForLogin")?.attributeValue;
    const secretKey = attributes.find((attribute: IGlobalAttributeValues) => attribute.attributeCode === "SecretKey")?.attributeValue;
    setSiteKey(siteKey ?? "false");
    setCaptchaRequired(captchaRequired ?? "false");
    setSecretKey(secretKey ?? "false");
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
        if (isCheckoutAsGuest) {
          onRegistrationComplete && onRegistrationComplete(true);
          handleCancel && handleCancel();
          router.push("/checkout");
        } else {
          router.push("/");
        }
        if (newRegisteredUser?.status === "success") {
          if (newRegisteredUser?.data.errorCode === ERROR_CODE.ADMIN_APPROVAL) {
            success(registerMessages("adminApprovalSuccessMessage"));
            setIsLoading(false);
            router.push("/login");
          }
          const result = await signIn("credentials", {
            redirect: false,
            username: formData.userName,
            password: formData.password,
            storeCode: storeCode,
          });

          if (result?.error) {
            logServer.error(AREA.WIDGET, errorStack(error));
          } else {
            if (isCheckoutAsGuest) {
              window.location.href = "/";
            } else {
              window.location.href = "/";
            }
          }
        } else if (newRegisteredUser?.hasError) {
          error(newRegisteredUser.errorMessage);
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
    setFormData(registerUserRequest);
    setIsFormSubmitted(true);
  };

  return (
    <div className="md:m-4 min-[992px]:m-0 lg:m-4 min-[1200px]:m-0">
      <Heading
        name={registerMessages("createAnAccount")}
        customClass="uppercase xs:text-base text-center text-white bg-black"
        dataTestSelector="hdgCreateAccount"
        level="h1"
      />
      <div className={`${!isFromCheckout ? "grid-cols-2 gap-16 md:grid lg:gap-32" : "grid-cols-1 md:grid"} mt-6 md:mt-10 md:mb-8`}>
        <div className="col-span-1 mb-10 md:mb-0">
          <Heading name={registerMessages("registerForAccount")} dataTestSelector="hdgRegisterForAccount" customClass="text-center uppercase " level="h1" showSeparator />
          <div className="p-0 sm:p-0 md:px-5 md:pt-3 md:w-full mb-5">
            <form onSubmit={handleSubmit(onSubmit)} method="post">
              <div className="pb-2">
                <label className="font-semibold" htmlFor="userName">
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
                {errors.userName && <ValidationMessage message={errors.userName.message} />}
              </div>

              <div className="pb-2">
                <label className="font-semibold" htmlFor="password">
                  {registerMessages("password")}
                  <strong className="ml-1 text-errorColor">*</strong>
                </label>
                <input
                  type="password"
                  className="w-full h-10 px-2 py-1 mt-2 input "
                  {...register("password", {
                    required: registerMessages("requiredPassword"),
                    pattern: { value: REG_EX.Password, message: registerMessages("passwordPatternMessage") },
                  })}
                  aria-label={registerMessages("password")}
                  data-test-selector="txtPasswordField"
                />

                {errors.password && <ValidationMessage message={errors.password.message} />}
              </div>

              <div className="pb-2">
                <label className="font-semibold" htmlFor="retypePassword">
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
                {errors.retypePassword && <ValidationMessage message={errors.retypePassword.message} />}
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

              <div className="items-center sm:flex">
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
                  onClick={() => router.push("/login")}
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
        {false && siteKey && siteKey !== "" && (
          <Recaptcha
            onVerify={handleRecaptchaVerify}
            recaptchaRef={reCaptchaRef}
            siteKey={siteKey}
            secretKey={secretKey}
            dataTestSelector="divRegisterRecaptcha"
          />
        )}{" "}
      </div>
    </div>
  );
};
