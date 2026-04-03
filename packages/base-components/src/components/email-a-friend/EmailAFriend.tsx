"use client";

import { IEmailAFriendRequest, IEmailFriendResponse } from "@znode/types/email-friend";

import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { INPUT_REGEX } from "@znode/constants/regex";
import { ValidationMessage } from "../common/validation-message";
import { sendEmailToFriend } from "../../http-request/email-friend/email-friend";
import { useForm } from "react-hook-form";
import { useModal } from "../../stores/modal";
import { useState } from "react";
import { useToast } from "../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

export const EmailAFriend = ({ productName }: { productName: string }) => {
  const emailTranslation = useTranslationMessages("Email");
  const { closeModal } = useModal();
  const { error, success } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IEmailAFriendRequest>({
    mode: "onChange",
  });

  const onSubmit = async (emailAFriendModel: IEmailAFriendRequest) => {
    setIsLoading(true);
    const currentURL = window.location.href;
    emailAFriendModel.productUrl = currentURL;
    emailAFriendModel.productName = productName;
    const email: IEmailFriendResponse = await sendEmailToFriend(emailAFriendModel);
    if (email.isSuccess) {
      success(emailTranslation("sendEmail"));
      closeModal();
    } else {
      error(emailTranslation("errorInSendingMail"));
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="mb-6">
        <Heading customClass="uppercase" name="email a friend" dataTestSelector="hdgEmailAFriend" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="pb-4">
          <div className="pb-2 required">
            <label className="font-semibold">
              {emailTranslation("yourEmailAddress")} <strong className="ml-1 text-errorColor">*</strong>
            </label>
          </div>
          <input
            className="h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black  w-80"
            {...register("yourMailId", {
              required: emailTranslation("requiredEmailAddress"),
              pattern: { value: INPUT_REGEX.EMAIL_REGEX, message: emailTranslation("emailPatternMessage") },
            })}
          />
          {errors?.yourMailId && <ValidationMessage message={errors?.yourMailId?.message} dataTestSelector="requiredYourMailIdError" />}
        </div>
        <div className="pb-8">
          <div className="pb-2 required">
            <label className="font-semibold">
              {emailTranslation("friendEmailAddress")} <strong className="ml-1 text-errorColor">*</strong>
            </label>
          </div>
          <input
            className="h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black  w-80"
            {...register("friendMailId", {
              required: emailTranslation("requiredEmailAddress"),
              pattern: { value: INPUT_REGEX.EMAIL_REGEX, message: emailTranslation("emailPatternMessage") },
            })}
          />
          {errors?.friendMailId && <ValidationMessage message={errors?.friendMailId?.message} dataTestSelector="requiredFriendMailIdError" />}
        </div>
        <div className="text-right">
          <Button
            htmlType="submit"
            type="primary"
            size="small"
            loading={isLoading}
            showLoadingText={true}
            className="h-10 w-32"
            loaderHeight="40px"
            loaderWidth="20px"
            dataTestSelector="btnEmailFriend"
          >
            {emailTranslation("sendMail")}
          </Button>
          {/* )} */}
        </div>
      </form>
    </>
  );
};
