"use client";

import React, { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { DISCOUNT_TYPE } from "@znode/constants/checkout";
import { ICSRDiscountTaxExemptProps } from "@znode/types/checkout";
import { SETTINGS } from "@znode/constants/settings";
import { ValidationMessage } from "../../common/validation-message/ValidationMessage";
import { ZIcons } from "../../common/icons/ZIcons";
import { useCheckout } from "../../../stores/checkout";
import { useForm } from "react-hook-form";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../stores/user-store";

const CSRDiscountTaxExempt: React.FC<ICSRDiscountTaxExemptProps> = ({
  checked,
  onCheckboxChange,
  onApply,
  message,
  setDiscountMessage,
  handleRemoved,
  applyLoading,
  isFromQuote,
}) => {
  const { orderSummaryData, isTaxExempt } = useCheckout();
  const { user } = useUser();
  const checkoutTranslations = useTranslationMessages("Checkout");
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [isCSRDiscountApplied, setIsCSRDiscountApplied] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{ discount: string }>({
    defaultValues: { discount: "" },
  });

  const handleFormSubmit = (data: { discount: string }) => {
    const discount = Number(data.discount);
    if (data.discount !== "") {
      if (isNaN(discount) || discount < 0) {
        setError("discount", { type: "manual", message: checkoutTranslations("enterValidNumber") });
      } else if (discount > Number(orderSummaryData.subTotal) - Number(orderSummaryData.totalDiscount)) {
        setError("discount", { type: "manual", message: checkoutTranslations("csrDiscountSubTotalError") });
      } else {
        clearErrors("discount");
        onApply(data);
        setDiscountAmount(Number(data.discount));
      }
    } else {
      setError("discount", { type: "manual", message: checkoutTranslations("csrDiscountRequired") });
    }
  };

  useEffect(() => {
    if (orderSummaryData.csrDiscountAmount) {
      setValue("discount", orderSummaryData.csrDiscountAmount.toString());
      setDiscountMessage(orderSummaryData.discounts?.find((discount) => discount.discountType === DISCOUNT_TYPE.CSR_DISCOUNT)?.message ?? "");
      setDiscountAmount(orderSummaryData.csrDiscountAmount);
    }
    csrDiscountApplied();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSummaryData]);

  const csrDiscountApplied = () => {
    if (orderSummaryData.discounts?.length === 0) {
      setIsCSRDiscountApplied(false);
    }
    return setIsCSRDiscountApplied(orderSummaryData.discounts?.some((discount) => discount.discountType === DISCOUNT_TYPE.CSR_DISCOUNT) ?? false);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
        <label className="font-semibold" data-test-selector="lblCSRDiscount">
          {checkoutTranslations("csrDiscount")}
        </label>
        <div className="flex pt-2">
          <input
            disabled={isCSRDiscountApplied}
            type="text"
            {...register("discount", {
              pattern: {
                value: /^[0-9]*\.?[0-9]*$/,
                message: checkoutTranslations("enterValidNumber"),
              },
              min: {
                value: 0,
                message: checkoutTranslations("enterValidNumber"),
              },
            })}
            className="h-10 px-2 py-1 input w-full"
          />
          <Button
            htmlType="submit"
            type="primary"
            size="small"
            dataTestSelector="btnApplyCsrDiscount"
            className="ml-3"
            ariaLabel="Apply"
            loaderColor="currentColor"
            loaderWidth="20px"
            loading={applyLoading}
            loaderHeight="20px"
            disabled={isCSRDiscountApplied || !!errors.discount}
          >
            {checkoutTranslations("apply")}
          </Button>
        </div>
        {errors.discount && <p className="text-errorColor mt-1 text-sm">{errors.discount.message}</p>}
        {errors.discount ? (
          ""
        ) : discountAmount && Number(discountAmount) > Number(orderSummaryData.subTotal) - Number(orderSummaryData.totalDiscount) ? (
          <ValidationMessage customClass="text-errorColor mt-1 text-sm" message={message} />
        ) : (
          <div className="flex items-center gap-2 mt-1">
            {message !== "" && (
              <Button
                type="text"
                size="small"
                className="pt-0.5"
                startIcon={<ZIcons name="x" width="18px" strokeWidth="1.5px" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgRemoveCSRDiscount" />}
                onClick={() => {
                  handleRemoved();
                  setValue("discount", "");
                  setDiscountMessage("");
                  setDiscountAmount(null);
                }}
                dataTestSelector="btnRemoveCSRDiscount"
              />
            )}
            <ValidationMessage customClass="text-successColor text-sm" message={message} />
          </div>
        )}
      </form>

      <div className="ml-1">
        <div className="flex items-center gap-2">
          <input
            disabled={user?.isTaxExempt}
            className="h-4 xs:w-4 rounded-custom accent-accentColor"
            name="taxEmpty"
            id="taxEmpty"
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckboxChange(e.target.checked)}
          />

          <label className="pl-1 cursor-pointer " htmlFor="taxEmpty" data-test-selector="lblTaxEmpty">
            {isTaxExempt ? (isFromQuote ? checkoutTranslations("quoteExempted") : checkoutTranslations("orderExempted")) : checkoutTranslations("makeTaxEmpty")}
          </label>
        </div>
        <div className="mt-2 text-sm">{user?.isTaxExempt && checkoutTranslations("profileBaseMessage")}</div>
      </div>
    </div>
  );
};

export default CSRDiscountTaxExempt;
