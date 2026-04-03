"use client";

import { IAttributeDetails, IBaseAttribute } from "@znode/types/attribute";
import { INVENTORY, PRODUCT } from "@znode/constants/product";
import { IProductAddOn, IProductAddOnValues } from "@znode/types/product";
import React, { useEffect, useState } from "react";
import { useProduct, useUser } from "../../../../../../stores";

import { FormatPriceWithCurrencyCode } from "../../../../../common/format-price";
import Input from "../../../../../common/input/Input";
import { ValidationMessage } from "../../../../../common/validation-message";
import { getAttributeValue } from "@znode/utils/common";
import { useTranslations } from "next-intl";

export const RadioAddon = ({
  addOn,
  shouldShowError,
  currencyCode,
  isLoginToSeePricing,
}: {
  addOn: IProductAddOn;
  shouldShowError?: boolean;
  currencyCode: string;
  isLoginToSeePricing?: boolean;
}) => {
  const addOnValues = addOn?.addOnValues;

  const { product, setSelectedAddons, setIsAddToCart, setAddOnValidation } = useProduct();
  const { selectedAddons, addOnValidation } = product;
  const [isAddOnRadioErrorShow, setIsAddOnRadioErrorShow] = useState<boolean>(true);
  const addonTranslations = useTranslations("Addon");
  const { user } = useUser();

  function handleAddOnChange(sku: string | undefined, quantity: number, attributes: IBaseAttribute[]) {
    const inventoryStatus = getAttributeValue(attributes as IAttributeDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues");
    const dontTrackInventory = inventoryStatus === INVENTORY.DONT_TRACK_INVENTORY || false;
    const allowBackOrdering = inventoryStatus === INVENTORY.ALLOW_BACK_ORDERING || false;
    const addons: IProductAddOn[] = selectedAddons && selectedAddons.length > 0 ? [...selectedAddons] : [];
    const addOnValuesArray: IProductAddOn = {
      groupName: addOn.groupName,
      addOnValues: [{ sku, quantity, dontTrackInventory, allowBackOrdering }],
    };
    const newAddons = addons.filter((x) => x.groupName !== addOn.groupName);
    if (addOnValuesArray.addOnValues && addOnValuesArray.addOnValues?.length > 0) newAddons.push(addOnValuesArray);
    setSelectedAddons(newAddons);
    setIsAddOnRadioErrorShow(false);
    if (quantity === 0 && !dontTrackInventory && !allowBackOrdering) {
      setIsAddToCart(true);
      setValidationMessage(addonTranslations("productOutOfStock"));
      setAddOnValidation({ [`${addOn.groupName}`]: addonTranslations("productOutOfStock") });
    } else {
      setIsAddToCart(false);
      setValidationMessage("");
      setAddOnValidation({ [`${addOn.groupName}`]: "" });
    }
  }
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    if (selectedAddons.length === 0) {
      setIsAddOnRadioErrorShow(true);
    }
  }, [selectedAddons]);

 
  const renderRadioAddOnValues = () => {
    return (
      addOnValues &&
      addOnValues.map((addOnValue: IProductAddOnValues, i: number) => {
        const price: number = addOnValue.salesPrice ? addOnValue.salesPrice : addOnValue.retailPrice || 0;
        return (
          <div className="flex items-center pb-1" key={i} data-test-selector={`divAddOnValue-${addOnValue?.publishProductId}`}>
            <Input
              type="radio"
              className="h-4 form-radio xs:w-4 accent-accentColor"
              id={`add-on-value-radio-${addOnValue?.publishProductId}-${addOnValue?.sku}`}
              onChange={() => handleAddOnChange(addOnValue?.sku, addOnValue.quantity || 0, addOnValue?.attributes as IBaseAttribute[])}
              checked={
                selectedAddons &&
                selectedAddons?.find((x: IProductAddOn) => x.groupName === addOn.groupName)?.addOnValues?.some((x: IProductAddOnValues) => x.sku === addOnValue?.sku)
              }
              dataTestSelector={`chkAddOn${addOnValue?.publishProductId}`}

              ariaLabel={`${addOnValue?.name} (+$ ${price?.toFixed(2)})`}

            />

            <label
              className="pl-3 cursor-pointer"
              htmlFor={`add-on-value-radio-${addOnValue?.publishProductId}-${addOnValue?.sku}`}
              data-test-selector={`lblAddOn${addOnValue?.publishProductId}`}
            >
              {addOnValue?.name}
              <div>
                {isLoginToSeePricing && !user ? null : (
                  <div>
                    (+
                    <FormatPriceWithCurrencyCode price={price} currencyCode={currencyCode} />)
                  </div>
                )}
              </div>
            </label>
          </div>
        );
      })
    );
  };

  useEffect(() => {
    const isDefault = selectedAddons.find((addOnData) => addOnData.groupName?.toLowerCase() === addOn.groupName?.toLowerCase());
    if (isDefault?.addOnValues && isDefault.addOnValues.length > 0) {
      setIsAddOnRadioErrorShow(false);
    }
    setValidationMessage(addOnValidation[`${addOn.groupName}`]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnValidation, selectedAddons]);

  return (
    addOnValues && (
      <>
        {renderRadioAddOnValues()}
        {isAddOnRadioErrorShow && shouldShowError && (
          <ValidationMessage
            message={addonTranslations("addonIsRequired", { name: addOn.groupName })}
            dataTestSelector="addOnIsRequiredError"
            customClass="text-sm text-errorColor"
          />
        )}
        <ValidationMessage message={validationMessage} />
      </>
    )
  );
};
