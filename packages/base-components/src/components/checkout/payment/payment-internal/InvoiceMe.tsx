import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import Heading from "../../../common/heading/Heading";
import { IPaymentOption } from "@znode/types/payment";
import Input from "../../..//common/input/Input";
import { LoadingSpinner } from "../../../common/icons";
import { PAYMENT_SUBTYPE } from "@znode/constants/payment";
import { PaymentOptions } from "../../payment/payment-options/PaymentOptions";
import { getOfflinePaymentConfigurations } from "../../../../http-request/payment";
import { usePayment } from "../../../../stores";
import { useTranslations } from "next-intl";
import { ValidationMessage } from "../../../common/validation-message";
import { INPUT_REGEX } from "@znode/constants/regex";

export interface IRecord {
  orderNumber?: string;
  paymentType?: string;
  remainingOrderAmount?: number;
  userId?: number;
  total?: number;
}
interface InvoiceMeProps {
  currentRecord: IRecord | undefined;
  setPaymentProcessing: Dispatch<SetStateAction<boolean>>;
}

const InvoiceMe = (props: InvoiceMeProps) => {
  const [paymentOptions, setPaymentOptions] = useState<IPaymentOption[]>();
  const [isLoading, setIsLoading] = useState(true);
  const paymentTranslations = useTranslations("Payment");
  const { payment, setInvoiceOrderNumber } = usePayment();
  const [paymentAmountError, setPaymentAmountError] = useState<string | null>(null);
  const [payableAmount, setPayableAmount] = useState<string>(String(props?.currentRecord?.total));
  const [isPaymentAmountFieldDisabled, setIsPaymentAmountFieldDisabled] = useState<boolean>(false);

  useEffect(() => {
    const submitBtn = document?.getElementById("submit-payment");
    if (!submitBtn) return;

    if (paymentAmountError && paymentAmountError !== "") {
      submitBtn?.setAttribute("disabled", "true");
      submitBtn?.classList.add("cursor-not-allowed");
    } else {
      submitBtn?.removeAttribute("disabled");
      submitBtn?.classList.remove("cursor-not-allowed");
    }
  }, [paymentAmountError]);

  useEffect(() => {
    getPaymentOptions();
  }, []);

  async function getPaymentOptions() {
    const payment = await getOfflinePaymentConfigurations();
    setPaymentOptions(payment);
    setIsLoading(false);
  }

  useEffect(() => {
    setPaymentAmountError("");
    setPayableAmount(String(props?.currentRecord?.remainingOrderAmount));
    setInvoiceOrderNumber(props?.currentRecord?.orderNumber ?? "");
    if (payment?.subTypeCode && payment?.subTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.ACH.toLowerCase()) setIsPaymentAmountFieldDisabled(false);
    else setIsPaymentAmountFieldDisabled(true);
  }, [props?.currentRecord, payment?.subTypeCode, setInvoiceOrderNumber]);

  const handleOnBlur = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target?.value.trim();
    const decimalRegex = INPUT_REGEX.ONLY_NUMBER_DECIMAL_REGEX;
    if (!inputValue || !decimalRegex.test(inputValue)) {
      setPayableAmount(String(props?.currentRecord?.remainingOrderAmount));
      setPaymentAmountError("");
    } else {
      const amount = parseFloat(inputValue);
      setPayableAmount(amount.toFixed(2));
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event?.target?.value;
    const inputRegex = INPUT_REGEX.ONLY_NUMBER_DECIMAL_REGEX;
    if (inputValue && inputRegex.test(inputValue)) {
      setPayableAmount(inputValue);
      setInvoiceOrderNumber(props?.currentRecord?.orderNumber ?? "");
      const amount = parseFloat(inputValue);
      const totalAmount = props?.currentRecord?.remainingOrderAmount ?? 0;
      if (amount > totalAmount) setPaymentAmountError(paymentTranslations("errorPaymentGreaterThanTotal"));
      else if (amount === 0) setPaymentAmountError(paymentTranslations("errorPaymentZero"));
      else setPaymentAmountError("");
    } else {
      setPayableAmount(String(inputValue));
      setPaymentAmountError("");
    }
  };

  return (
    <div className="items-center justify-center">
      {isLoading ? (
        <div className="flex justify-center items-center h-80">
          <LoadingSpinner width="50px" height="50px" />
        </div>
      ) : (
        <>
          <div>
            <Heading name={paymentTranslations("makePayment")} customClass="uppercase" dataTestSelector="hdgMakePayment" />
          </div>
          <div className="payment-view-content">
            <h3 className="block-title text-left py-1">
              {paymentTranslations("orderNumber")} : {props.currentRecord?.orderNumber}
            </h3>
            <h3 className="block-title text-left py-1">
              {paymentTranslations("orderTotal")} : {props.currentRecord?.total}
            </h3>
            <h3 className="block-title text-left py-1">
              {paymentTranslations("amountDue")} : {props.currentRecord?.remainingOrderAmount}
            </h3>
            <div className="mb-6 mt-2">
              <Input
                type="number"
                className={`px-2 py-1 w-1/2 ${isPaymentAmountFieldDisabled ? "cursor-not-allowed" : ""}`}
                id="myTextbox"
                placeholder=""
                disabled={isPaymentAmountFieldDisabled}
                value={payableAmount}
                onChange={handleInputChange}
                onBlur={handleOnBlur}
                isLabelShow={true}
                label={paymentTranslations("paymentAmount")}
                isRequired={true}
                labelCustomClass="font-semibold"
                dataTestSelector="txtPaymentAmount"
              />
              {paymentAmountError && <ValidationMessage message={paymentAmountError} dataTestSelector="paymentAmountError" />}
            </div>
            {paymentOptions && (
              <PaymentOptions
                paymentOptions={paymentOptions}
                setPaymentProcessing={props?.setPaymentProcessing}
                total={Number(payableAmount) ?? 0}
                jobName={""}
                additionalInstruction={""}
                isOfflinePayment={true}
              ></PaymentOptions>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceMe;
