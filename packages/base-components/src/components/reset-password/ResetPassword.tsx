"use client";

import { FieldError, UseFormRegisterReturn, useForm } from "react-hook-form";
import { Suspense, useEffect, useRef, useState } from "react";

import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { IChangePassword } from "@znode/types/user";
import { INPUT_REGEX } from "@znode/constants/regex";
import { ResetPasswordStatusEnum } from "@znode/types/enums";
import { ValidationMessage } from "../common/validation-message";
import { getResetPasswordStatus } from "../../http-request/account/reset-password/reset-password";
import { logClient } from "@znode/logger";
import { resetPassword } from "../../http-request/account/user/user";
import { useRouter } from "next/navigation";
import { useToast } from "../../stores/toast";
import { useTranslations } from "next-intl";
import { userActivityLog } from "../../http-request/user-activity-log/user-activity-log";
import { USER_ACTIVITY_EVENT } from "@znode/constants/user-activity-event";

export const ResetPassword = ({ passwordInfo }: { passwordInfo: IChangePassword }) => {
  const router = useRouter();
  const userPasswordMessages = useTranslations("UserPassword");
  const commonMessages = useTranslations("Common");
  const { error, success } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IChangePassword>({ mode: "onChange" });

  const newPassword = watch("newPassword");
  const reTypeNewPassword = watch("reTypeNewPassword");

  const [isLoading, setLoading] = useState<boolean>(false);
  const hasErrorShown = useRef(false);
  const [previousToken, setPreviousToken] = useState("");

  /**
   * Submits the form data to reset the password
   *
   * @param {IChangePassword} changePasswordModel - The form data containing new password and password token
   * @return {Promise<void>} - A promise that resolves when the password reset is successful or rejects with an error message
   */
  const onSubmit = async (changePasswordModel: IChangePassword) => {
    if (newPassword !== reTypeNewPassword) return;
    setLoading(true);
    changePasswordModel.passwordToken = passwordInfo?.passwordToken;
    changePasswordModel.userName = passwordInfo?.userName;
    const data = await resetPassword(changePasswordModel);
    if (data.hasError === false) {
      success(userPasswordMessages("resetPasswordMessage"));
      userActivityLog({ eventName: USER_ACTIVITY_EVENT.FORGOT_PASSWORD, activityStatus: USER_ACTIVITY_EVENT.COMPLETED, userData: { userName: changePasswordModel.userName } });
      router.push("/login");
    } else {
      const errorMessage = data?.errorMessage || userPasswordMessages("resetPasswordError");
      setLoading(false);
      error(errorMessage);
      userActivityLog({
        eventName: USER_ACTIVITY_EVENT.FORGOT_PASSWORD,
        activityError: errorMessage,
        activityStatus: USER_ACTIVITY_EVENT.FAILED,
        userData: { userName: changePasswordModel.userName },
      });
    }
  };

  const fetchResetStatus = async () => {
    const currentToken = passwordInfo?.passwordToken;
    const userName = passwordInfo.userName;
    if (currentToken && currentToken !== previousToken) {
      setPreviousToken(currentToken);
      try {
        setLoading(true);
        const response = await getResetPasswordStatus({ passwordToken: currentToken, userName: userName });
        if (response) {
          if (response === ResetPasswordStatusEnum.LinkExpired) {
            error(userPasswordMessages("linkExpiredErrorMessage"));
            router.push("/forgot-password");
          } else if (response === ResetPasswordStatusEnum.TokenMismatch) {
            error(userPasswordMessages("tokenMismatch"));
            router.push("/forgot-password");
          } else if (response === ResetPasswordStatusEnum.NoRecord) {
            error(userPasswordMessages("noRecordFound"));
            router.push("/forgot-password");
          } else {
            hasErrorShown.current = false;
          }
          setLoading(false);
        }
      } catch (err) {
        logClient.error("An error occurred while fetching the reset password status.");
        return false;
      }
    }
  };

  useEffect(() => {
    fetchResetStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense>
      <Heading name={userPasswordMessages("createYourPassword")} customClass="uppercase" dataTestSelector="hdgCreateYourPassword" level="h1" showSeparator />
      <div className="sm:w-4/5 md:w-1/2 lg:w-2/6 h-72 mb-3">
        <form onSubmit={handleSubmit(onSubmit)} method="post">
          <PasswordInput
            id="new-password"
            label={userPasswordMessages("newPassword")}
            register={register("newPassword", {
              required: userPasswordMessages("requiredNewPassword"),
              pattern: { value: INPUT_REGEX.PASSWORD_REGEX, message: userPasswordMessages("passwordPatternMessage") },
            })}
            errors={errors?.newPassword}
            dataTestSelector="NewPassword"
          />
          <PasswordInput
            id="confirm-new-password"
            label={userPasswordMessages("confirmPassword")}
            register={register("reTypeNewPassword", {
              required: userPasswordMessages("requiredConfirmNewPassword"),
            })}
            errors={errors?.reTypeNewPassword}
            dataTestSelector="ConfirmNewPassword"
          />
          {reTypeNewPassword && newPassword !== reTypeNewPassword && (
            <ValidationMessage message={userPasswordMessages("passwordNotMatch")} dataTestSelector="requiredPasswordNotMatchError" />
          )}
          <Button
            htmlType="submit"
            type="primary"
            size="small"
            loading={isLoading}
            showLoadingText={true}
            className="w-full sm:w-auto mt-2"
            dataTestSelector="btnSubmit"
            ariaLabel={userPasswordMessages("submitResetPasswordButton")}
            loaderHeight="20"
            loaderWidth="20"
          >
            {commonMessages("submit")}
          </Button>
        </form>
      </div>
    </Suspense>
  );
};

const PasswordInput = ({
  id,
  label,
  register,
  errors,
  placeholder,
  dataTestSelector,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn<"newPassword"> | UseFormRegisterReturn<"reTypeNewPassword">;
  errors: FieldError | undefined;
  placeholder?: string;
  dataTestSelector: string;
}) => (
  <div className="pb-2">
    <div className="pb-2 required">
      <label htmlFor={id} className="font-semibold" data-test-selector={`lbl${dataTestSelector}`}>
        {label} <strong className="text-errorColor">*</strong>
      </label>
    </div>
    <input type="password" className="w-full h-10 px-2 py-1 input " {...register} id={id} placeholder={placeholder || ""} data-test-selector={`txt${dataTestSelector}`} />
    {errors && <ValidationMessage message={errors.message} dataTestSelector={`error${dataTestSelector}`} />}
  </div>
);
