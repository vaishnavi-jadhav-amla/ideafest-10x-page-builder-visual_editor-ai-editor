"use client";

import React, { useState } from "react";

import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { INPUT_REGEX } from "@znode/constants/regex";
import { IResetPasswordRequest } from "@znode/types/account";
import { ValidationMessage } from "../common/validation-message";
import { forgotPassword } from "../../http-request/account/user/user";
import { getBaseUrl } from "@znode/utils/common";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "../../stores/toast";
import { useTranslations } from "next-intl";
import { userActivityLog } from "../../http-request/user-activity-log/user-activity-log";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";

export const ForgotPassword = () => {
  const router = useRouter();
  const { error, success } = useToast();
  const userPasswordMessages = useTranslations("UserPassword");
  const commonMessages = useTranslations("Common");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IResetPasswordRequest>({ mode: "onChange" });
  const onSubmit = async (userModel: IResetPasswordRequest) => {
    setIsLoading(true);
    const baseUrl = getBaseUrl();
    userModel.baseUrl = baseUrl;
    const { hasError } = (await forgotPassword(userModel)) || {};
    if (hasError === false) {
      userActivityLog({ eventName: USER_ACTIVITY_EVENT.FORGOT_PASSWORD, activityStatus: USER_ACTIVITY_EVENT.REQUESTED, userData: {userName: userModel?.userName} });
      success(userPasswordMessages("emailMessage"));
      router.push("/login");
    } else {
      setIsLoading(false);
      error(userPasswordMessages("invalidUserName"));
    }
  };

  return (
    <>
      <Heading name={userPasswordMessages("createYourPassword")} customClass="uppercase" dataTestSelector="hdgCreateYourPassword" level="h1" showSeparator />
      <p className="mb-4">{userPasswordMessages("forgetPasswordText")}</p>
      <div className="h-64 sm:w-4/5 md:w-1/2 lg:w-2/6" data-test-selector="divForgetPassword">
        <form onSubmit={handleSubmit(onSubmit)} method="post">
          <div className="pb-2 mb-3">
            <div className="pb-2 required">
              <label htmlFor="username" className="font-semibold" data-test-selector="lblEmail">
                {userPasswordMessages("username")}/{userPasswordMessages("email")} <strong className="ml-1 text-errorColor">*</strong>
              </label>
            </div>
            <input
              className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
              {...register("userName", {
                required: userPasswordMessages("requiredEmailAddress"),
                pattern: { value: INPUT_REGEX.EMAIL_REGEX, message: userPasswordMessages("emailPatternMessage") },
              })}
              placeholder=""
              id="username"
              data-test-selector="txtUserName"
            />
            {errors?.userName && <ValidationMessage message={errors?.userName?.message} dataTestSelector="requiredUsernameError" />}
          </div>
          <div className="items-center sm:flex">
            <Button
              htmlType="submit"
              type="primary"
              size="small"
              loading={isLoading}
              showLoadingText={true}
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
              className="w-full sm:w-auto"
              dataTestSelector="btnSubmitRequest"
              ariaLabel={userPasswordMessages("submitRequest")}
            >
              <span className="uppercase">{userPasswordMessages("submitRequest")}</span>
            </Button>
            <Button type="secondary" size="small" className="mt-3 w-full sm:w-auto sm:mt-0 sm:ml-3" onClick={() => router.push("/login")} dataTestSelector="btnCancel">
              {commonMessages("cancel")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
