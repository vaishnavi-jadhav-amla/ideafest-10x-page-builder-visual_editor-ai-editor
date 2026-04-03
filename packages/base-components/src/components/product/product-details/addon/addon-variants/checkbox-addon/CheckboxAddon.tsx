"use client";

import { IProductAddOn, IProductAddOnValues } from "@znode/types/product";
import React, { useEffect, useState } from "react";

import AddOnCheckboxTypeOptions from "./CheckboxAddonOptions";
import { ValidationMessage } from "../../../../../common/validation-message";
import { useProduct } from "../../../../../../stores";
import { useTranslations } from "next-intl";

export const CheckboxAddon = ({
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
  const [isAddOnCheckboxErrorShow, setAddOnCheckboxErrorShow] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const addonTranslations = useTranslations("Addon");
  const { product } = useProduct();
  const { selectedAddons, addOnValidation } = product;
  useEffect(() => {
    if (selectedAddons.length === 0) {
      setAddOnCheckboxErrorShow(true);
    }
  }, [selectedAddons]);

  useEffect(() => {
    const isDefault = selectedAddons.find((addOnData) => addOnData.groupName?.toLowerCase() === addOn.groupName?.toLowerCase());
    if (isDefault?.addOnValues && isDefault.addOnValues.length > 0) {
      setAddOnCheckboxErrorShow(false);
    }
    setValidationMessage(addOnValidation[`${addOn.groupName}`]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnValidation, selectedAddons]);

  const renderCheckboxAddOnValues = () => {
    return (
      addOnValues &&
      addOnValues.map((addOnValue: IProductAddOnValues, i: number) => {
        return (
          <div className="flex items-center pb-1" key={i} data-test-selector={`divAddOnValue-${addOnValue?.publishProductId}`}>
            <AddOnCheckboxTypeOptions
              setValidationMessage={setValidationMessage}
              addOnValueData={addOnValue}
              addOn={addOn}
              setAddOnCheckboxErrorShow={setAddOnCheckboxErrorShow}
              currencyCode={currencyCode}
              isLoginToSeePricing={isLoginToSeePricing}
            />
          </div>
        );
      })
    );
  };

  return (
    addOnValues && (
      <>
        {renderCheckboxAddOnValues()}
        {isAddOnCheckboxErrorShow && shouldShowError && <p className="text-sm text-errorColor">{addonTranslations("addonIsRequired", { name: addOn.groupName })}</p>}
        <ValidationMessage message={validationMessage} dataTestSelector="addOnValidation" />
      </>
    )
  );
};
