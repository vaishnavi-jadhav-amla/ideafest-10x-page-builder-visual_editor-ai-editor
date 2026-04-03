"use client";

import Button from "../../common/button/Button";
import { REG_EX } from "@znode/constants/app";
import { ValidationMessage } from "../../common/validation-message";
import { signUpForNewsLetter } from "../../../http-request";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

interface INewsLetterProps {
  label: string;
  placeholder: string;
  buttonText: string;
}
export interface INewsLetterFormValues {
  email: string;
}
export function NewsLetter(props: Readonly<INewsLetterProps>) {
  const { label = "", placeholder = "", buttonText = "" } = props || {};
  const commonTranslations = useTranslationMessages("Common");
  const { error, success } = useToast();

  const [isLoading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<INewsLetterFormValues>({
    mode: "onSubmit",
  });

  const onSubmit = async (model: INewsLetterFormValues) => {
    try {
      setLoading(true);
      const response = await signUpForNewsLetter(model);
      if (response?.isSuccess) {
        success(commonTranslations("newsLetterEmailMessage"));
        reset();
      } else error(response?.errorMessage || commonTranslations("somethingWentWrong"));
    } catch (err) {
      error(commonTranslations("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2 items-center flex-wrap p-2">
        <label className="text-lg font-semibold block" data-test-selector="lblFistName">
          {label}
        </label>
        <div className="relative">
          <input
            type="email"
            {...register("email", { required: commonTranslations("requiredEmailAddress"), pattern: { value: REG_EX.Email, message: commonTranslations("emailPatternMessage") } })}
            placeholder={placeholder}
            className="p-2 w-full max-w-xs border transition rounded-inputBorderRadius h-10 text-textColor"
          />
          {errors?.email && (
            <div className="absolute -bottom-6 text-left">
              <ValidationMessage message={errors?.email?.message} dataTestSelector="requiredEmailAddressError" />
            </div>
          )}
        </div>
        <Button
          dataTestSelector="btnSubmit"
          htmlType="submit"
          className="uppercase tracking-wider"
          type="primary"
          size="small"
          ariaLabel={buttonText}
          loading={isLoading}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
          showLoadingText={true}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
