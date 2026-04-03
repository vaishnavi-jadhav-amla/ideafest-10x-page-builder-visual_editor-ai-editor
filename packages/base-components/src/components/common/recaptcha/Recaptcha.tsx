"use client";

import React, { MutableRefObject, useEffect } from "react";

import { IRecaptchaPayload } from "@znode/types/recaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyRecaptcha } from "../../../http-request/recaptcha";

interface IRecaptchaProps {
  onVerify: (_arg1: boolean) => void;
  recaptchaRef: MutableRefObject<ReCAPTCHA | null>;
  siteKey: string;
  secretKey?: string;
  dataTestSelector?: string;
}

export const Recaptcha: React.FC<IRecaptchaProps> = ({ onVerify, recaptchaRef, siteKey, secretKey, dataTestSelector }) => {
  const handleVerify = async (token: string | null) => {
    if (!secretKey || !token) {
      return;
    }
    try {
      const recaptchaPayload: IRecaptchaPayload = {
        secret: String(secretKey),
        response: token,
      };
      const recaptchaResponse = await verifyRecaptcha(recaptchaPayload);
      if (recaptchaResponse && recaptchaResponse.success) {
        onVerify(true);
      } else {
        onVerify(false);
      }
    } catch (error) {
      onVerify(false);
    }
  };
  useEffect(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.execute();
    }
  }, [recaptchaRef]);

  return <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={siteKey || ""} onChange={handleVerify} data-test-selector={dataTestSelector} />;
};
