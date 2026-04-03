/* eslint-disable max-len */
"use client";

import { IApplyDiscountRequest, IDiscounts } from "@znode/types/cart";
import { SubmitHandler, useForm } from "react-hook-form";
import { applyDiscount, getCartNumber, removeDiscount } from "../../../http-request";
import { useCheckout, usePromoLoadingStore, useUser } from "../../../stores";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { COMMON } from "@znode/constants/common";
import { DISCOUNT_TYPE } from "@znode/constants/checkout";
import { FormatPriceWithCurrencyCode } from "../format-price";
import { Heading } from "../heading";
import { LoaderComponent } from "../loader-component";
import { PAYMENT } from "@znode/constants/payment";
import { SETTINGS } from "@znode/constants/settings";
import { ValidationMessage } from "../validation-message";
import { ZIcons } from "../icons";
import { logClient } from "@znode/logger";
import { stringToBooleanV2 } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";
import { IGeneralSetting } from "@znode/types/general-setting";
import dayjs from "dayjs";

interface ICouponDetails {
  couponValue: string;
}

export default function Promo(props: { type: string; isCart?: boolean; currencyCode?: string; shippingPinCode?: string; generalSetting?: IGeneralSetting }) {
  const { isPromoLoading, setIsPromoLoading } = usePromoLoadingStore();
  const { isCart = false, shippingPinCode = "", generalSetting } = props;
  const { currencyCode = PAYMENT.UNITED_STATES_SUFFIX } = props;
  const { type } = props || { type: DISCOUNT_TYPE.COUPON };
  const { register, handleSubmit, reset, getValues } = useForm<ICouponDetails>();
  const { orderSummaryData, setOrderSummaryData, isUnAssociatedProductEntity, shippingOptionId, setEnterPinCode, isTaxExempt } = useCheckout();
  const { user } = useUser();
  const promoTranslations = useTranslationMessages("Discount");
  const vouchersTranslations = useTranslationMessages("Promotions");
  const behaviorTranslations = useTranslationMessages("BehaviorMsg");
  const checkoutTranslations = useTranslationMessages("Checkout");
  const [invalidPromoMessage, setInvalidPromoMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const codeType = type === DISCOUNT_TYPE.GIFT_CARD ? "VoucherCode" : "PromoCode";

  const getTranslations = (text: string) => {
    return type === DISCOUNT_TYPE.GIFT_CARD ? vouchersTranslations(text) : promoTranslations(text);
  };

  useEffect(() => {
    !isUnAssociatedProductEntity && setInvalidPromoMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnAssociatedProductEntity]);

  const validateBehaviorMsg = () => {
    if (isUnAssociatedProductEntity) {
      setInvalidPromoMessage("");
      setInvalidPromoMessage(behaviorTranslations("behaviorCouponMsg"));
      return true;
    }
    return false;
  };

  const checkDuplicateOrExceededVoucher = (couponDetails: ICouponDetails): boolean => {
    const trimmedCode = couponDetails.couponValue ? couponDetails.couponValue.trim().toLowerCase() : "";
    if (type === DISCOUNT_TYPE.GIFT_CARD) {
      if (orderSummaryData?.orderTotalWithoutVoucher === 0) {
        setInvalidPromoMessage(vouchersTranslations("voucherLimitExceeded"));
        setIsLoading(false);
        return true;
      }
      const set = new Set();
      orderSummaryData?.discounts?.forEach((discount) => {
        discount &&
          discount.discountType === DISCOUNT_TYPE.GIFT_CARD &&
          stringToBooleanV2(discount.isApplied) &&
          stringToBooleanV2(discount.isValid) &&
          set.add(discount.discountCode);
      });
      if (set.has(trimmedCode)) {
        setInvalidPromoMessage(vouchersTranslations("duplicateVoucher"));
        reset();
        setIsLoading(false);
        return true;
      }
    }
    // Duplicate coupon check for COUPON type
    const appliedCodes = orderSummaryData?.discounts?.map((d) => d.discountCode?.toLowerCase()) || [];
    const allAppliedCodes = [...appliedCodes];

    if (allAppliedCodes.includes(trimmedCode)) {
      setInvalidPromoMessage(getTranslations("duplicateCoupon"));
      reset();
      setIsLoading(false);
      return true;
    }
    return false;
  };

  const onSubmit: SubmitHandler<ICouponDetails> = async (couponDetails: { couponValue: string }) => {
    const cartItemsHasErrors = validateBehaviorMsg();
    if (cartItemsHasErrors) return;
    if (couponDetails.couponValue.trim() !== "") {
      setIsLoading(true);
      setIsPromoLoading(true);
      setInvalidPromoMessage("");
      const isDuplicate: boolean = checkDuplicateOrExceededVoucher(couponDetails);
      if (isDuplicate) return;
      try {
        const cartNumber = await getCartNumber();
        const applyDiscountRequest: IApplyDiscountRequest = {
          discountCode: couponDetails.couponValue.trim(),
          discountType: type,
          cartNumber: cartNumber,
          isCart: isCart,
          isShippingOptionSelected: shippingOptionId ? true : false,
          isTaxEmpty: isTaxExempt,
        };
        const discountDetails = await applyDiscount(applyDiscountRequest);

        if (discountDetails && discountDetails.discountStatus?.isSuccess) {
          setEnterPinCode(shippingPinCode ?? "");
          setOrderSummaryData(discountDetails.calculatedDetails);
        }
        reset();
        setIsLoading(false);
        setIsPromoLoading(false);
      } catch (error) {
        logClient.error("An error occurred while fetching cart number or applying discount.");
      }
    } else {
      setInvalidPromoMessage(getTranslations("enterValidPromo"));
    }
  };

  const handleRemoveDiscount = async (code: string, type: string) => {
    setIsPromoLoading(true);
    const removeDiscountRequestModel: IApplyDiscountRequest = {
      discountType: type,
      discountCode: code,
      cartNumber: await getCartNumber(),
      isCart: isCart,
      isShippingOptionSelected: shippingOptionId ? true : false,
      isTaxEmpty: isTaxExempt,
    };
    const removeDiscountResponse = await removeDiscount(removeDiscountRequestModel);
    removeDiscountResponse?.discountStatus?.isSuccess && setOrderSummaryData(removeDiscountResponse.calculatedDetails);
    setInvalidPromoMessage("");
    setIsPromoLoading(false);
  };

  const getDiscountMessage = (discounts: IDiscounts[]) => {
    if (!discounts || discounts.length === 0) {
      return null;
    }

    const filteredDiscount = discounts.filter((discount) => discount.discountType === type);

    if (!filteredDiscount.length) {
      return null;
    }

    if (type === DISCOUNT_TYPE.GIFT_CARD) {
      return getVoucherSuccessMessage(filteredDiscount);
    } else if (type === DISCOUNT_TYPE.COUPON) {
      return getCouponMessage(filteredDiscount);
    }
  };

  const formatMessage = (message: string) => {
    if (!message) return "";
    return message
      .split(" ")
      .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()))
      .join(" ");
  };

  const expirationEndTime = (date: Date | string): string => {
    if (!date || !generalSetting?.timeFormat || !generalSetting.displayTimeZone) return "";
    return dayjs(date).tz(generalSetting.displayTimeZone)
.endOf("day")
.format(generalSetting.timeFormat);
  };

  const getCouponMessage = (discounts: IDiscounts[]) => {
    return discounts.map((coupon: IDiscounts, index: number) => (
      <div className="flex items-center" key={coupon.discountCode}>
        <div
          data-test-selector={`divPromoCoupon${index}`}
          className={`text-sm ${stringToBooleanV2(coupon?.isApplied ?? COMMON.FALSE_VALUE) ? "text-successColor" : "text-errorColor"}`}
        >
          <Button
            type="text"
            size="small"
            className="pt-0.5"
            startIcon={
              <ZIcons name="x" width={"18px"} viewBox="0 0 24 10" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector={`svgRemoveCoupon${index}`} />
            }
            onClick={() => handleRemoveDiscount(coupon.discountCode ?? "", coupon.discountType ?? "")}
            dataTestSelector={`btnRemoveCoupon${index}`}
          />
          <strong data-test-selector={`${stringToBooleanV2(coupon?.isApplied ?? COMMON.FALSE_VALUE) ? `spnCouponCode${index}` : `valInvalidCouponCode${index}`}`}>
            {coupon.discountCode}
          </strong>
          {coupon?.message && (
            <span data-test-selector={`${stringToBooleanV2(coupon?.isApplied ?? COMMON.FALSE_VALUE) ? `spnCouponMessage${index}` : `valInvalidCouponMessage${index}`}`}>
              &nbsp;- {formatMessage(coupon.message)}
              {coupon.message?.trim().endsWith(".") ? "" : "."}
            </span>
          )}{" "}
        </div>
      </div>
    ));
  };

  const getVoucherSuccessMessage = (discounts: IDiscounts[]) => {
    return discounts?.map((voucher: IDiscounts, index: number) =>
      isPromoLoading ? (
        <LoaderComponent key={voucher.code} isLoading={true} width="18px" height="18px" />
      ) : (
        <div className="flex items-center text-sm" key={voucher.code}>
          <Button
            type="text"
            size="small"
            className="pt-0.5"
            startIcon={<ZIcons name="x" width={"18px"} strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector={`svgRemoveVoucher${index}`} />}
            onClick={() => handleRemoveDiscount(voucher.discountCode ?? "", voucher.discountType ?? "")}
            dataTestSelector={`btnRemoveVoucher${index}`}
          />
          {voucher.isApplied === "True" && voucher.isValid === "True" ? (
            <p data-test-selector="paraVoucherText">
              <span className="font-medium" data-test-selector={`spnVoucherAmount${index}`}>
                <FormatPriceWithCurrencyCode price={voucher.appliedAmount || 0} currencyCode={currencyCode} />{" "}
              </span>
              {voucher.name} {vouchersTranslations("Expires")} : ({expirationEndTime(voucher.expiryDate?.toString())})&nbsp;
              <span data-test-selector={`spnVoucherNumber${index}`}>{voucher.discountCode}</span>
            </p>
          ) : (
            <div data-test-selector="divPromoCoupon" className={"text-sm text-errorColor"}>
              <span data-test-selector={`valInvalidVoucherCode${index}`} className="font-semibold">
                {voucher.discountCode}
              </span>
              {voucher.message && (
                <>
                  <span className="font-semibold px-0.5">-</span>
                  <span data-test-selector={`valInvalidVoucherMessage${index}`}>{voucher.message}</span>
                </>
              )}
            </div>
          )}
        </div>
      )
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Heading
            name={
              user?.crsName !== "" && Number(user?.userId) > 0 && type !== DISCOUNT_TYPE.GIFT_CARD && !isCart ? checkoutTranslations("promoMessage") : getTranslations("promotions")
            }
            level="h2"
            customClass={`uppercase xs:w-full ${type === DISCOUNT_TYPE.GIFT_CARD ? "text-base" : ""}`}
            dataTestSelector={`hdg${codeType}`}
            showSeparator
          />
          <div className="py-2">
            <label className={`font-semibold ${type === DISCOUNT_TYPE.GIFT_CARD ? "text-sm" : ""}`} data-test-selector={`lbl${codeType}`}>
              {getTranslations("promoCode")}
            </label>
            <div className="flex pt-2">
              <input
                className={`h-10 px-2 py-1 input  ${type === DISCOUNT_TYPE.GIFT_CARD ? "w-half" : "w-full"}`}
                {...register("couponValue")}
                data-test-selector={`txt${codeType}`}
                aria-label="Promo Code"
                onBlur={() => {
                  if (getValues("couponValue") === "") setInvalidPromoMessage("");
                }}
              />
              <Button
                htmlType="submit"
                type="primary"
                size="small"
                dataTestSelector={`btn${codeType}`}
                className={`ml-3 ${isLoading ? "px-7" : ""}`}
                ariaLabel="Apply"
                loading={isLoading}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
              >
                {getTranslations("apply")}
              </Button>
            </div>
          </div>
        </div>
      </form>
      <div className="mb-2">
        <ValidationMessage message={invalidPromoMessage} dataTestSelector={`invalid${codeType}Error`} />
      </div>
      {orderSummaryData.discounts && orderSummaryData.discounts.length > 0 && (
        <div data-test-selector={`div${codeType}Message`} className="flex flex-col gap-2 mb-1">
          {getDiscountMessage(orderSummaryData.discounts || [])}
        </div>
      )}
    </>
  );
}
