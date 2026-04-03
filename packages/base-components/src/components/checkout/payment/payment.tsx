"use client";

import { Heading } from "../../common/heading";
import { IBaseDropDownOptions } from "@znode/types/payment";
import { IBaseResponse } from "@znode/types/response";
import Input from "../../common/input/Input";
import Promo from "../../common/promotions/Promo";
import { errorStack } from "@znode/logger/server";
import { logClient } from "@znode/logger";
import { useCheckout } from "../../../stores/checkout";
import { useTranslations } from "next-intl";

interface IPaymentOptionData {
  paymentOptionData?: IBaseDropDownOptions[];
  isOfflinePayment?: boolean;
  isFromQuote?: boolean;
  //setShowPlaceOrder?: Dispatch<SetStateAction<boolean>>;
  dueAmount?: number;
  total?: number;
}

export function Payment({ paymentOptionData }: IPaymentOptionData) {
  const checkoutTranslations = useTranslations("Checkout");

  const { paymentSettingId, setPaymentSettingId } = useCheckout();

  const handleInputChange = (paymentMethod: IBaseDropDownOptions) => {
    try {
      if (paymentMethod && paymentMethod?.value) {
        setPaymentSettingId(paymentMethod?.value);
      }
    } catch (error) {
      logClient.error("Error in method - handleInputChange " + errorStack(error));
      return { hasError: true } as IBaseResponse;
    }
  };

  const renderPaymentMethods = (paymentMethods: IBaseDropDownOptions[]) => {
    if (paymentMethods.length > 0) {
      return paymentMethods?.map((paymentMethod: IBaseDropDownOptions) => {
        return (
          <div className="flex items-center" key={paymentMethod?.id}>
            <Input
              type="radio"
              className="h-4 form-radio xs:w-4 accent-accentColor"
              //disabled={total ? total <= 0 : false}
              id={`${paymentMethod?.text}-${paymentMethod?.id}`}
              checked={String(paymentSettingId) === paymentMethod?.value}
              dataTestSelector={`txtPayment${paymentMethod?.id}`}
              onChange={() => handleInputChange(paymentMethod)}
              ariaLabel={paymentMethod?.text}
            />
            <label
              // className={false ? "ml-4 text-gray-300 font-normal" : "font-normal ml-4 cursor-pointer"}
              className={"font-normal ml-4 cursor-pointer"}
              htmlFor={`${paymentMethod?.text}-${paymentMethod?.id}`}
              data-test-selector={`lblPayment${paymentMethod?.text}`}
            >
              {paymentMethod?.text}
            </label>
          </div>
        );
      });
    }
  };

  return (
    <>
      <Heading name="Payment Method" customClass="border-b mb-4" dataTestSelector="hdgPaymentMethod" />
      <div>
        <Promo type={"GIFTCARD"} />
      </div>
      <div className="xs:w-full">
        <Heading customClass="uppercase" level="h3" name={checkoutTranslations("paymentType")} dataTestSelector="hdgPaymentType" showSeparator />
        <div className="space-y-1.5">{renderPaymentMethods(paymentOptionData ?? [])}</div>
      </div>
    </>
  );
}
