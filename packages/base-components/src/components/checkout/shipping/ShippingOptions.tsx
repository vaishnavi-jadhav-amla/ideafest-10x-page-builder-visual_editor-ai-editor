"use client";

import { ISaveShippingDetails, IShippingOption } from "@znode/types/shipping";
import { useCartDetails, useCheckout } from "../../../stores";

import { CHECKOUT } from "@znode/constants/checkout";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import Input from "../../common/input/Input";
import { getCartNumber } from "../../../http-request/cart/get-cart-number";
import { saveShippingDetails } from "../../../http-request/checkout/shipping-options";
import { useEffect } from "react";
import { useTranslationMessages } from "@znode/utils/component";
import { getLocalStorageData, setLocalStorageData, removeLocalStorageData } from "@znode/utils/component";

export function ShippingOptions({
  shippingOptions,
  currencyCode,
  freeShipping,
  shippingConstraintCode,
  inHandDate,
  addressId,
}: Readonly<{
  shippingOptions: IShippingOption[];
  noShippingOptions?: boolean;
  freeShipping?: boolean;
  currencyCode?: string;
  inHandDate?: string;
  shippingConstraintCode?: string;
  addressId?: number;
}>) {
  const checkoutTranslations = useTranslationMessages("Checkout");
  const { shippingOptionId, setShippingOptionId } = useCheckout();
  const { refreshCartSummary } = useCartDetails();

  useEffect(() => {
    const checkAndSetShippingOption = () => {
      if (shippingOptionId || shippingOptions.length === 0) return;
      const savedId = getLocalStorageData("selectedShippingOptionId");
      if (!savedId) return;
      const parsedId = Number(savedId);
      if (!Number.isInteger(parsedId)) {
        removeLocalStorageData("selectedShippingOptionId");
        return;
      }
      const isValidOption = shippingOptions.some((option) => option.shippingId === parsedId);
      if (isValidOption) {
        setShippingOptionId(parsedId);
      } else {
        removeLocalStorageData("selectedShippingOptionId");
      }
    };
    checkAndSetShippingOption();
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedShippingOptionId") {
        checkAndSetShippingOption();
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingOptions, shippingOptionId]);

  useEffect(() => {
    if (shippingOptionId) {
      submitShippingDetails(shippingOptionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inHandDate, shippingConstraintCode]);

  const submitShippingDetails = async (optionId: number | undefined) => {
    let status = false;

    if (optionId) {
      const shippingDetails: ISaveShippingDetails = {
        shippingId: optionId,
        cartNumber: await getCartNumber(),
      };

      if (inHandDate && shippingConstraintCode && addressId) {
        shippingDetails.inHandDate = new Date(inHandDate);
        shippingDetails.shippingAddressId = addressId;
        shippingDetails.shippingConstraintCode = shippingConstraintCode;
        shippingDetails.isShipCompletely = shippingConstraintCode === CHECKOUT.SHIP_COMPLETE ? true : false;
      }

      status = await saveShippingDetails(shippingDetails);

      return status;
    }
    return status;
  };

  const handleInputChange = async (optionId: number | undefined) => {
    const status = await submitShippingDetails(optionId);
    if (status && optionId) {
      refreshCartSummary();
      setShippingOptionId(optionId);
      setLocalStorageData("selectedShippingOptionId", optionId.toString());
    }
  };

  const getShippingMethods = (shippingOptions: IShippingOption[]) => {
    if (shippingOptions.length > 0) {
      const hasFreeShipping = freeShipping && shippingOptions.some((shipping) => shipping.shippingCode === CHECKOUT.FREE_SHIPPING);
      return hasFreeShipping ? renderFreeShipping(shippingOptions) : renderShippingMethods(shippingOptions);
    }
  };

  const renderShippingMethods = (shippingOptions: IShippingOption[]) => {
    const showErrorMessage = shippingOptions.some((shippingMethod) => shippingMethod.shippingCode !== CHECKOUT.FREE_SHIPPING);

    return (
      <div className="pr-3.5 space-y-1.5">
        {shippingOptions && shippingOptions.length > 0
          ? shippingOptions?.map((shippingMethod: IShippingOption, i: number) => {
              const estimateDate = shippingMethod.estimateDate ? shippingMethod.estimateDate : "";
              if (shippingMethod.shippingCode !== CHECKOUT.FREE_SHIPPING) {
                return (
                  <div className="flex items-center" data-test-selector={`divShippingOptions${i}`} key={i}>
                    <Input
                      type="radio"
                      className="h-4 form-radio xs:w-4 accent-accentColor"
                      id={`${shippingMethod?.shippingCode}-${shippingMethod?.shippingId}`}
                      checked={shippingOptionId === shippingMethod.shippingId}
                      onChange={() => handleInputChange(shippingMethod?.shippingId)}
                      dataTestSelector={`chkShippingMethod${shippingMethod?.shippingCode}`}
                      ariaLabel={`${shippingMethod?.description} - ${estimateDate} (+$${shippingMethod?.shippingRate?.toFixed(2)})`}

                      
                    />
                    <label
                      className="ml-4 font-normal cursor-pointer"
                      htmlFor={`${shippingMethod?.shippingCode}-${shippingMethod.shippingId}`}
                      data-test-selector={`lblShippingMethod${shippingMethod?.shippingCode}`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: shippingMethod?.description || "" }}></span>
                      {estimateDate && ` - ${estimateDate}`}
                      {" - "}
                      <FormatPriceWithCurrencyCode price={shippingMethod?.shippingRate || 0} currencyCode={currencyCode || "USD"} />
                      {shippingMethod?.shippingRate !== undefined &&
                        shippingMethod?.shippingRateWithoutDiscount !== undefined &&
                        shippingMethod?.shippingRateWithoutDiscount !== null &&
                        shippingMethod?.shippingRateWithoutDiscount > 0 && (
                          <span className="pl-2 line-through text-errorColor">
                            &#123;
                            <FormatPriceWithCurrencyCode price={shippingMethod?.shippingRateWithoutDiscount} currencyCode={currencyCode || "USD"} />
                            &#125;
                          </span>
                        )}
                    </label>
                  </div>
                );
              } else if (!showErrorMessage) {
                return (
                  <p data-test-selector="paraNoShippingOptions" key={`${shippingMethod.shippingCode}_NoShippingOptions`}>
                    {checkoutTranslations("noShippingOptions")}
                  </p>
                );
              }
            })
          : null}
      </div>
    );
  };

  const renderFreeShipping = (shippingOptions: IShippingOption[]) => {
    return (
      shippingOptions &&
      shippingOptions.length > 0 &&
      shippingOptions?.map((shippingMethod: IShippingOption, i: number) => {
        const estimateDate = shippingMethod.estimateDate ? shippingMethod.estimateDate : "";
        if (shippingMethod.shippingCode === CHECKOUT.FREE_SHIPPING) {
          return (
            <div className="flex flex-col gap-1" key={`shippingOptions${i}`}>
              <div className="flex items-center" key={i}>
                <Input
                  type="radio"
                  className="h-4 form-radio xs:w-4 accent-accentColor"
                  id={`${shippingMethod?.shippingCode}-${shippingMethod?.shippingId}`}
                  checked={shippingOptionId === shippingMethod.shippingId}
                  onChange={() => handleInputChange(shippingMethod?.shippingId)}
                  dataTestSelector={`chkShippingMethod${shippingMethod?.shippingCode}`}
                  ariaLabel="shipping options"
                />
                <label
                  className="ml-4 font-semibold"
                  htmlFor={`${shippingMethod?.shippingCode}-${shippingMethod?.shippingId}`}
                  data-test-selector={`lblShippingMethod${shippingMethod?.shippingCode}`}
                >
                  {shippingMethod?.description}
                  {estimateDate && ` - ${estimateDate}`}
                  {" - "}
                  {shippingMethod?.shippingRate && shippingMethod?.shippingRate > 0 ? (
                    <FormatPriceWithCurrencyCode price={shippingMethod?.shippingRate || 0} currencyCode={currencyCode || "USD"} />
                  ) : (
                    <FormatPriceWithCurrencyCode price={0.0} currencyCode={currencyCode || "USD"} />
                  )}
                  {shippingMethod?.shippingRate !== undefined &&
                    shippingMethod?.shippingRateWithoutDiscount !== undefined &&
                    shippingMethod?.shippingRateWithoutDiscount !== null &&
                    shippingMethod?.shippingRateWithoutDiscount > 0 && (
                      <span className="pl-2 line-through text-errorColor">
                        &#123;
                        <FormatPriceWithCurrencyCode price={shippingMethod?.shippingRateWithoutDiscount} currencyCode={currencyCode || "USD"} />
                        &#125;
                      </span>
                    )}
                </label>
              </div>
              <div className="text-green-500"> {checkoutTranslations("freeShippingMessage")}</div>
            </div>
          );
        }
      })
    );
  };

  return (
    <div className="md:w-3/5">
      <div>{getShippingMethods(shippingOptions)}</div>
    </div>
  );
}
