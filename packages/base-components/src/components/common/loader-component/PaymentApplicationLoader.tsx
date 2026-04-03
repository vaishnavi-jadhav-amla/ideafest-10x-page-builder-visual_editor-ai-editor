import Heading from "../heading/Heading";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

type ModalProps = {
  customClass?: string;
  isPaymentProcessing?: boolean;
};

const PaymentApplicationLoader: React.FC<ModalProps> = ({ customClass, isPaymentProcessing }) => {
  const paymentTranslations = useTranslationMessages("Payment");

  return (
    isPaymentProcessing && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-gray-800 opacity-50"></div>
        <div className={`bg-white z-10 relative max-w-lg ${customClass}`}>
          <div className="px-4 py-3">
            <div className="mb-8" data-test-selector="divPaymentApplicationHeading">
              <Heading name={paymentTranslations("paymentApplication")} dataTestSelector="hdgPaymentApplication" />
            </div>
            <div>
              <p data-test-selector="paraPaymentProcessing">{paymentTranslations("paymentProcessing")}</p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default PaymentApplicationLoader;
