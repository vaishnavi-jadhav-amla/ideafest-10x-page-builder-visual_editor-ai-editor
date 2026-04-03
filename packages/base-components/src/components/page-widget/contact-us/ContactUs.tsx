"use client";

import { Path, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

import { BreadCrumbs } from "../../common/breadcrumb";
import Button from "../../common/button/Button";
import { IContactFormValues } from "@znode/types/contact";
import Link from "next/link";
import { REG_EX } from "@znode/constants/app";
import { Recaptcha } from "../../common/recaptcha/Recaptcha";
import { SWR_DEFAULT_PARAMS } from "@znode/constants/swr";
import { ValidationMessage } from "../../common/validation-message";
import { contactUs } from "../../../http-request";
import { getCaptchaData } from "../../../http-request";
import { sanitizeInputValue } from "@znode/utils/common";
import useSWR from "swr";
import { useToast } from "../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

interface IFormFields {
  key: string;
  type: string;
  required: boolean;
  name: Path<IContactFormValues>;
  pattern?: RegExp;
  patternMessage?: string;
  maxLength?: number;
}

const formFields: IFormFields[] = [
  {
    key: "firstName",
    name: "firstName",
    type: "text",
    maxLength: 100,
    required: true,
  },
  {
    key: "lastName",
    name: "lastName",
    type: "text",
    maxLength: 100,
    required: true,
  },
  {
    key: "companyName",
    name: "companyName",
    type: "text",
    maxLength: 100,
    required: true,
  },
  {
    key: "emailAddress",
    name: "emailId",
    type: "email",
    required: true,
    pattern: REG_EX.Email,
    maxLength: 250,
  },
  {
    key: "phoneNumber",
    name: "phoneNumber",
    type: "text",
    required: true,
    maxLength: 30,
    pattern: REG_EX.OnlyNumberAllowed,
  },
  {
    key: "comments",
    name: "comments",
    type: "text",
    required: true,
    maxLength: 500,
  },
];

type formDataProps = {
  payload: IContactFormValues;
  reVerify: boolean;
  isFormSubmitted: boolean;
  siteKey: string;
  loading: boolean;
  captchaRequired: boolean;
  secretKey: string;
};

type contactUsProps = {
  heading?: string | null;
  description?: string | null;
};
export const ContactUs = ({ heading, description }: contactUsProps) => {
  const [formData, setFormData] = useState<formDataProps>({
    payload: {
      firstName: "",
      lastName: "",
      emailId: "",
      companyName: "",
      phoneNumber: "",
      comments: "",
    },
    reVerify: false,
    isFormSubmitted: false,
    siteKey: "",
    loading: false,
    captchaRequired: false,
    secretKey: "",
  });

  const reCaptchaRef = useRef(null);

  const contactUsMessages = useTranslationMessages("ContactUs");
  const commonMessages = useTranslationMessages("Common");
  const { error, success } = useToast();
  const { REVALIDATE_IF_STALE: revalidateIfStale, REVALIDATE_ON_FOCUS: revalidateOnFocus, REVALIDATE_ON_RECONNECT: revalidateOnReconnect } = SWR_DEFAULT_PARAMS;
  const { data } = useSWR("/", getCaptchaData, { revalidateIfStale, revalidateOnFocus, revalidateOnReconnect });
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    reset,
  } = useForm<IContactFormValues>({ mode: "onChange" });

  useEffect(() => {
    if (data) {
      const { siteKey, isCaptchaRequired, secretKey } = data || {};
      setFormData((prev) => ({ ...prev, siteKey, captchaRequired: isCaptchaRequired ? JSON.parse(isCaptchaRequired) : false, secretKey }));
    }
  }, [data]);

  useEffect(() => {
    formData.isFormSubmitted && formData.reVerify && submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.isFormSubmitted, formData.reVerify]);

  const handleRecaptchaVerify = async (reVerify: boolean) => {
    setFormData((prev) => ({ ...prev, reVerify }));
  };

  const submit = async () => {
    try {
      const response = await contactUs(formData.payload);
      if (!response?.hasError) {
        success(contactUsMessages("successMessageContactUs"));
        reset();
      } else {
        const errorMessage = response?.errorMessage;
        error(errorMessage);
      }
    } catch (exception) {
      error(commonMessages("somethingWentWrong"));
    } finally {
      setFormData((prev) => ({ ...prev, loading: false, isFormSubmitted: false }));
    }
  };

  const onSubmit = async (contact: IContactFormValues) => {
    const contactModel = getValues();
    if (!contactModel) return;
    setFormData({ ...formData, isFormSubmitted: true, loading: true, payload: contact });
    const { captchaRequired, reVerify } = formData;
    if (captchaRequired && !reVerify) {
      error(commonMessages("captchaVerificationError"));

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
    <div>
      <BreadCrumbs breadCrumbsTitle={contactUsMessages("contactUs")} />
      <div className="px-5 pt-2">
        <div className="mb-6">
          {heading && <h1 className="heading-1 font-semibold uppercase">{heading}</h1>}
          {description && <h6>{description}</h6>}
        </div>
        <div className="md:w-2/4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              {formFields.map((data: IFormFields) => {
                const inputId = `input-${data.key}`;
                return (
                  <div key={data.key}>

                    <label
                      className="font-semibold mb-2 block"
                      data-test-selector={`lbl${data.key}`}
                      htmlFor={inputId}
                    >
                      {contactUsMessages(data.key)}
                      {data.required && (
                        <strong className="text-errorColor">*</strong>
                      )}
                    </label>
                    <input
                      id={inputId}
                      className="border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black px-2 py-1 w-full h-10"

                      data-test-selector={`txt${data.key}`}
                      type={data.type}
                      {...register(data.name, {
                        required: data.required && contactUsMessages(`${data.key}Required`),


                        maxLength: data.maxLength && {
                          value: data.maxLength,
                          message: contactUsMessages(`${data.key}MaxLengthExceeded`),
                        },
                        pattern: data.pattern && {
                          value: data.pattern,
                          message: contactUsMessages(`${data.key}PatternMessage`),
                        },
                        validate: (value: string) => sanitizeInputValue(value, data.required ? contactUsMessages(`${data.key}Required`) : ""),
                      })}
                      onBlur={() => trigger(data.name)}
                    />
                    {errors[data.name] && <ValidationMessage message={errors[data.name]?.message} dataTestSelector={`${data.key}Error`} />}
                  </div>
                );
              })};

            </div>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Button
                dataTestSelector="btnSubmit"
                htmlType="submit"
                className="btn btn-primary uppercase tracking-wider text-sm px-5 py-2"
                ariaLabel="submit button"
                loading={formData.loading}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
                showLoadingText={true}
              >
                {commonMessages("submit")}
              </Button>
              <Link href={"/"} className="btn btn-secondary uppercase tracking-wider text-sm  px-5 py-2" data-test-selector="linkCancel">
                {commonMessages("cancel")}
              </Link>
            </div>
          </form>
        </div>
      </div>
      {formData.captchaRequired && formData.siteKey && (
        <Recaptcha
          siteKey={formData.siteKey}
          onVerify={handleRecaptchaVerify}
          recaptchaRef={reCaptchaRef}
          secretKey={formData.secretKey}
          dataTestSelector="divContactUsRecaptcha"
        />
      )}
    </div>
  );
};
