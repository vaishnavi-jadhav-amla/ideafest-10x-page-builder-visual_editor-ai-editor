"use client";

import { Path, useForm } from "react-hook-form";
import { getCaptchaData, submitFeedback } from "../../../http-request";
import { useEffect, useRef, useState } from "react";

import { BreadCrumbs } from "../../common/breadcrumb";
import Button from "../../common/button/Button";
import { IFeedbackFormValues } from "@znode/types/feedback";
import Link from "next/link";
import { REG_EX } from "@znode/constants/app";
import { Recaptcha } from "../../common/recaptcha/Recaptcha";
import { SWR_DEFAULT_PARAMS } from "@znode/constants/swr";
import { ValidationMessage } from "../../common/validation-message";
import useSWR from "swr";
import { useToast } from "../../../stores";
import { useTranslations } from "next-intl";

interface IFormFields {
  key: string;
  type: string;
  required: boolean;
  name: Path<IFeedbackFormValues>;
  pattern?: RegExp;
  patternMessage?: string;
}

const formFields: IFormFields[] = [
  {
    key: "comments",
    name: "comments",
    type: "text",
    required: true,
  },
  {
    key: "firstName",
    name: "firstName",
    type: "text",
    required: true,
  },
  {
    key: "lastName",
    name: "lastName",
    type: "text",
    required: true,
  },
  {
    key: "city",
    name: "city",
    type: "text",
    required: false,
  },
  {
    key: "state",
    name: "state",
    type: "text",
    required: false,
  },
  {
    key: "emailAddress",
    name: "emailId",
    type: "email",
    required: true,
    pattern: REG_EX.Email,
    patternMessage: "emailPatternMessage",
  },
];

type formDataProps = {
  payload: IFeedbackFormValues;
  reVerify: boolean;
  isFormSubmitted: boolean;
  siteKey: string;
  loading: boolean;
  captchaRequired: boolean;
  secretKey: string;
};

type feedbackProps = {
  heading?: string | null;
  description?: string | null;
};
export const Feedback = ({ heading, description }: feedbackProps) => {
  const t = useTranslations("Feedback");
  const t1 = useTranslations("Common");
  const { error, success } = useToast();
  const reCaptchaRef = useRef(null);
  const { REVALIDATE_IF_STALE: revalidateIfStale, REVALIDATE_ON_FOCUS: revalidateOnFocus, REVALIDATE_ON_RECONNECT: revalidateOnReconnect } = SWR_DEFAULT_PARAMS;
  const { data } = useSWR("/", getCaptchaData, { revalidateIfStale, revalidateOnFocus, revalidateOnReconnect });

  const [formData, setFormData] = useState<formDataProps>({
    payload: { allowSharingWithCustomers: true },
    reVerify: false,
    isFormSubmitted: false,
    siteKey: "",
    loading: false,
    captchaRequired: false,
    secretKey: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<IFeedbackFormValues>();

  useEffect(() => {
    if (data) {
      const { siteKey, isCaptchaRequired, secretKey } = data;
      setFormData((prev) => ({ ...prev, siteKey, captchaRequired: isCaptchaRequired ? JSON.parse(isCaptchaRequired) : false, secretKey }));
    }
  }, [data]);

  useEffect(() => {
    formData.isFormSubmitted && formData.reVerify && submitFeedbackForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.isFormSubmitted, formData.reVerify]);

  const submitFeedbackForm = async () => {
    setFormData((prev) => ({ ...prev, loading: true }));
    try {
      const feedbackData = await submitFeedback(formData.payload);
      if (feedbackData?.success) {
        success(t("successFeedbackMessage"));
        reset();
      } else error(t("errorMessageFeedback"));
    } catch (e) {
      error(t1("somethingWentWrong"));
    } finally {
      setFormData((prev) => ({ ...prev, loading: false, isFormSubmitted: false }));
    }
  };

  const handleRecaptchaVerify = async (reVerify: boolean) => {
    setFormData((prev) => ({ ...prev, reVerify }));
  };

  const onSubmit = async (feedback: IFeedbackFormValues) => {
    const feedbackModel = getValues();
    if (!feedbackModel) return;
    setFormData({ ...formData, isFormSubmitted: true, loading: true, payload: feedback });

    const { captchaRequired, reVerify } = formData;
    if (captchaRequired && !reVerify) {
      error(t1("captchaVerificationError"));

      setFormData((prev) => ({ ...prev, isFormSubmitted: false, loading: false }));
      return;
    } else {
      if (captchaRequired) {
        setFormData((prev) => ({ ...prev, reVerify: false }));
        //@ts-expect-error recaptcha library types not defined for reset
        reCaptchaRef && reCaptchaRef?.current && reCaptchaRef.current.reset();
        //@ts-expect-error recaptcha library types not defined for execute
        reCaptchaRef && reCaptchaRef?.current && reCaptchaRef.current.execute();
      } else {
        handleRecaptchaVerify(true);
      }
    }
  };
  return (
    <>
      <BreadCrumbs breadCrumbsTitle={t("feedback")} />

      <div className="px-5 py-2 md:w-2/4 my-2">
        <div className="mb-6">
          {heading && <h1 className="heading-1 font-semibold uppercase">{heading}</h1>}
          {description && <h6>{description}</h6>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            {formFields.map((data: IFormFields) => {
              const inputId = `input-${data.key}`;
              return (
                <div key={data.key}>
                  <label className="font-semibold mb-2 block" data-test-selector={`lbl${data.key}`} htmlFor={inputId}>
                    {t(data.key)} {data.required && <strong className="text-errorColor">*</strong>}
                  </label>
                  <input
                    id={inputId}
                    className="border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black px-2 py-1 w-full h-10"
                    type={data.type}
                    placeholder=""
                    {...register(data.name, {
                      ...(data.pattern
                        ? {
                            required: t(`${data.key}Required`),
                            pattern: {
                              value: data.pattern,
                              message: t(data.patternMessage),
                            },
                          }
                        : { required: data.required }),
                    })}
                  />
                  {errors[data.name] && <ValidationMessage message={data.pattern ? errors[data.name]?.message : t(`${data.key}Required`)} />}
                </div>
              );
            })}

            <div className="flex items-center my-1">
              <input
                type="checkbox"
                className="accent-accentColor"
                id="not-save"
                {...register("allowSharingWithCustomers")}
                checked={formData.payload?.allowSharingWithCustomers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payload: {
                      ...formData.payload,
                      allowSharingWithCustomers: e.target.checked,
                    },
                  })
                }
                data-test-selector="chkAllowSharing"
              />
              <label className="cursor-pointer pl-1 font-semibold" htmlFor="not-save" data-test-selector="lblAllowSharingWithCustomers">
                <p className="pl-1">{t("shareCustomerFeedback")}</p>
              </label>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Button
                dataTestSelector="btnSubmit"
                htmlType="submit"
                className="btn btn-primary uppercase tracking-wider text-sm"
                ariaLabel="submit button"
                loading={formData.loading}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
                showLoadingText={true}
              >
                {t1("submit")}
              </Button>

              <Link href="/" className="btn btn-secondary uppercase tracking-wider text-sm px-5 py-2" data-test-selector="linkCancel">
                {t1("cancel")}
              </Link>
            </div>
          </div>
        </form>
      </div>

      {formData.captchaRequired && formData.siteKey && (
        <Recaptcha siteKey={formData.siteKey} onVerify={handleRecaptchaVerify} recaptchaRef={reCaptchaRef} secretKey={formData.secretKey} dataTestSelector="divFeedbackRecaptcha" />
      )}
    </>
  );
};
