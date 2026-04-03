"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ISaveShippingDetails, IShippingEstimatorDetails, IShippingOption, IShippingRequest } from "@znode/types/shipping";
import { SubmitHandler, useForm } from "react-hook-form";
import { getShippingOptions, saveShippingDetails } from "../../http-request/checkout/shipping-options";
import { useCartDetails, useCheckout } from "../../stores";

import Button from "../common/button/Button";
import { FormatPriceWithCurrencyCode } from "../common/format-price";
import { Heading } from "../common/heading";
import Input from "../common/input/Input";
import { PAYMENT } from "@znode/constants/payment"; // Import the PAYMENT constant
import { SETTINGS } from "@znode/constants/settings";
import { SHIPPING_ESTIMATOR } from "@znode/constants/shipping";
import { ValidationMessage } from "../common/validation-message";
import { ZIP_CODE_REGEX } from "@znode/constants/regex";
import { ZIcons } from "../common/icons";
import { getCartNumber } from "../../http-request/cart/get-cart-number";
import { getCheckoutGuestUserDetails } from "@znode/agents/checkout/checkout-helper";
import {  getSavedUserSessionCallForClient } from "@znode/utils/common";
import { removeShippingByClassNumber } from "../../http-request/cart/remove-shipping-option";
import { useTranslationMessages } from "@znode/utils/component";

type IShipping = {
  reloadShippingEstimator: boolean;
  setIsShippingOptionSelected: Dispatch<SetStateAction<boolean>>;
};

export default function ShippingEstimator({ reloadShippingEstimator, setIsShippingOptionSelected }: IShipping) {
  const { setShippingOptionId, isUnAssociatedProductEntity, shippingOptionId, enterPinCode } = useCheckout();

  useEffect(() => {
    if (postalCode) {
      getShippingEstimates({ zipCode: postalCode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadShippingEstimator]);

  useEffect(() => {
    !isUnAssociatedProductEntity && setShippingMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnAssociatedProductEntity]);

  const currencyCode = PAYMENT.UNITED_STATES_SUFFIX;
  const cartTranslations = useTranslationMessages("Cart");
  const commonTranslations = useTranslationMessages("Common");
  const behaviorTranslations = useTranslationMessages("BehaviorMsg");
  const { register, handleSubmit, reset, setValue } = useForm<IShippingEstimatorDetails>();
  const [shippingMessage, setShippingMessage] = useState<string>();
  const [shippingOptionsData, setShippingOptionsData] = useState<IShippingOption[]>([]);
  const [showShippingOptions, setShowShippingOptions] = useState<boolean>();
  const [showCancel, setShowCancel] = useState<boolean>();
  const [postalCode, setPostalCode] = useState<string>();
  const { refreshCartSummary } = useCartDetails();
  const [selectShippingOption, setSelectShippingOption] = useState<number>();

  const validateBehaviorMsg = () => {
    if (isUnAssociatedProductEntity) {
      setShippingOptionsData([]);
      setShippingMessage(behaviorTranslations("behaviorEstimationShippingMsg"));
      setShowShippingOptions(true);
      return true;
    }
    return false;
  };

  const getShippingEstimates: SubmitHandler<IShippingEstimatorDetails> = async (ShippingEstimatorDetails: { zipCode: string }) => {
    const cartItemsHasErrors = validateBehaviorMsg();
    if (cartItemsHasErrors) return;
    setShowShippingOptions(true);
    let shippingOptionList;
    const zipCode = ShippingEstimatorDetails?.zipCode;
    const zipCodeRegexp = new RegExp(ZIP_CODE_REGEX.COMMON);

    if (!zipCode || zipCode === "") {
      setShippingOptionsData([]);
      setShippingMessage(cartTranslations("zipCodeError"));
    } else if (!zipCodeRegexp.test(zipCode)) {
      setShowCancel(true);
      setShippingOptionsData([]);
      setShippingMessage(commonTranslations("validationZipCode"));
    } else {
      setShowCancel(true);
      setShippingMessage(cartTranslations("pleaseWait"));
      setShippingOptionsData([]);
      setPostalCode(zipCode);
      const cartNumber = await getCartNumber();
      const shippingRequest: IShippingRequest = {
        shippingPostalCode: zipCode,
        isShippingEstimator: true,
        cartNumber: cartNumber,
        shippingAddressId: 0,
        billingAddressId: 0,
        userId: (await getUserId(cartNumber)) || 0,
      };
      shippingOptionList = await getShippingOptions(shippingRequest);
      setShippingOptionsData(shippingOptionList);
      shippingOptionList?.length ? setShippingMessage("") : setShippingMessage(cartTranslations("noShippingOptionsFound"));
    }
  };

  const getUserId = async (cartNumber: string) => {
    const user = await getSavedUserSessionCallForClient();
    const userId: number = user?.userId ?? 0;
    if (userId) {
      return userId;
    } else {
      const guestUserDetails = await getCheckoutGuestUserDetails(cartNumber);
      return guestUserDetails?.guestUserId;
    }
  };

  const handleShippingOptionChange = async (optionId: number) => {
    setIsShippingOptionSelected && setIsShippingOptionSelected(true);
    setSelectShippingOption(optionId);
    const cartNumber = await getCartNumber();
    const updateShippingDetailsRequest: ISaveShippingDetails = { shippingId: optionId, cartNumber: cartNumber };
    const status = await saveShippingDetails(updateShippingDetailsRequest);
    status && refreshCartSummary();
    setShippingOptionId(optionId);
  };

  const renderShippingOptions = () => {
    return shippingOptionsData
      ? shippingOptionsData?.map((shippingOption: IShippingOption, i: number) => {
          return (
            <div className="flex items-center pb-1" key={i}>
              <Input
                type="radio"
                className="h-4 form-radio xs:w-4 accent-accentColor"
                onChange={() => postalCode && shippingOption.shippingId && handleShippingOptionChange(shippingOption.shippingId)}
                checked={selectShippingOption === shippingOption?.shippingId || shippingOptionId === shippingOption?.shippingId}
                id={`${shippingOption?.shippingName}-${shippingOption.shippingId}`}
                dataTestSelector={`chkShipping${shippingOption?.shippingId}`}
                ariaLabel="shipping estimator"
              />
              <label
                className="flex items-center justify-between flex-1 pl-3 font-normal cursor-pointer"
                data-test-selector={`lblShipping${shippingOption?.shippingId}`}
                htmlFor={`${shippingOption?.shippingName}-${shippingOption.shippingId}`}
              >
                <span className="w-2/3" data-test-selector={`spnShippingName${shippingOption?.shippingId}`}>
                  {shippingOption?.shippingName}
                </span>
                <span className="w-1/3 pl-3 text-right" data-test-selector={`spnShippingRate${shippingOption?.shippingId}`}>
                  <FormatPriceWithCurrencyCode price={shippingOption?.shippingRate || 0} currencyCode={currencyCode} />
                </span>
              </label>
            </div>
          );
        })
      : null;
  };

  const handleCancel = async () => {
    if (selectShippingOption) {
      const cartNumber = await getCartNumber();
      const status = await removeShippingByClassNumber(cartNumber);
      if (status) {
        setShippingHooks();
        setShippingOptionId(null);
      }
    } else {
      setShippingHooks();
    }
  };

  const setShippingHooks = () => {
    setPostalCode("");
    reset();
    setShowCancel(false);
    setShowShippingOptions(false);
    setShippingOptionId(null);
    setSelectShippingOption(0);
    setIsShippingOptionSelected && setIsShippingOptionSelected(false);
  };

  useEffect(() => {
    if (enterPinCode) {
      setShowCancel(true);
      setShowShippingOptions(true);
      getShippingEstimates({ zipCode: enterPinCode });
      setValue("zipCode", enterPinCode); // Automatically set zipCode if enterPinCode exists
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterPinCode, setValue]);

  return (
    <>
      <form onSubmit={handleSubmit(getShippingEstimates)}>
        <div>
          <Heading name={cartTranslations("estimateShippingCosts")} customClass="uppercase" dataTestSelector="hdgEstimateShippingCost" level="h2" showSeparator />
          <div className="py-2">
            <label className="font-semibold" htmlFor="zip-code" data-test-selector="lblZipCode">
              {cartTranslations("zipCode")}
            </label>
            <div className="flex pt-2">
              <div className="relative w-full mr-3">
                <input
                  className="w-full h-10 px-2 py-1 input "
                  id="zip-code"
                  type="text"
                  maxLength={10}
                  {...register("zipCode")}
                  data-test-selector="txtZipCode"
                />
                {showCancel && (
                  <Button
                    type="text"
                    size="small"
                    className="absolute right-0 border-none top-1 xs:p-1"
                    dataTestSelector="btnCancelEstimate"
                    onClick={handleCancel}
                    startIcon={<ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgCancelEstimate" />}
                    ariaLabel="cross shipping estimator icon"
                  />
                )}
              </div>
              <Button htmlType="submit" type="primary" size="small" dataTestSelector="btnEstimate" ariaLabel="shipping estimate button">
                {cartTranslations("estimate")}
              </Button>
            </div>
          </div>
        </div>
      </form>
      {showShippingOptions && (
        <ValidationMessage
          message={shippingMessage}
          dataTestSelector={shippingMessage === SHIPPING_ESTIMATOR.PLEASE_WAIT ? "shippingMessage" : "shippingErrorMessage"}
          customClass={shippingMessage === SHIPPING_ESTIMATOR.PLEASE_WAIT ? "text-textColor" : "text-errorColor text-sm mt-1"}
        />
      )}
      {showShippingOptions && renderShippingOptions()}
    </>
  );
}
