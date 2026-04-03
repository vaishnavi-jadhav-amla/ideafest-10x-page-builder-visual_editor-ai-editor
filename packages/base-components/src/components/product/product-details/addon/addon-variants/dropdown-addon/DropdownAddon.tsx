"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { INVENTORY, PRODUCT } from "@znode/constants/product";
import { IProductAddOn, IProductAddOnValues } from "@znode/types/product";
import { formatTestSelector, getAttributeValue } from "@znode/utils/common";

import { FormatPriceWithCurrencyCode } from "../../../../../common/format-price";
import { IAttributeDetails } from "@znode/types/attribute";
import { SETTINGS } from "@znode/constants/settings";
import { ValidationMessage } from "../../../../../common/validation-message";
import { ZIcons } from "../../../../../common/icons";
import { useProduct } from "../../../../../../stores/product";
import { useTranslationMessages } from "@znode/utils/component";
import { useTranslations } from "next-intl";
import { useUser } from "../../../../../../stores";

export const DropdownAddon = ({
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
  const commonTranslations = useTranslationMessages("Common");
  const addonTranslations = useTranslations("Addon");
  const { product, setSelectedAddons, setIsAddToCart, setAddOnValidation } = useProduct();
  const { selectedAddons, addOnValidation } = product;
  const [isAddOnDropdownErrorShow, setAddOnDropdownErrorShow] = useState<boolean>(true);
  const addOnValues = addOn?.addOnValues;
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [defaultSelected, setDefaultSelected] = useState<IProductAddOnValues | null>();
  const { user } = useUser();

  useEffect(() => {
    if (selectedAddons.length === 0) {
      setAddOnDropdownErrorShow(true);
    }
  }, [selectedAddons]);

  function handleAddOnChange(event: ChangeEvent<HTMLSelectElement>) {
    const addons: IProductAddOn[] = selectedAddons && selectedAddons.length > 0 ? [...selectedAddons] : [];
    const inputValue = event.target.value;
    const selectedQty = addOnValues?.find((item) => item.sku === inputValue);
    const inventoryStatus = getAttributeValue(selectedQty?.attributes as IAttributeDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues");
    const dontTrackInventory = inventoryStatus === INVENTORY.DONT_TRACK_INVENTORY || false;
    const allowBackOrdering = inventoryStatus === INVENTORY.ALLOW_BACK_ORDERING || false;
    const addOnValuesArray: IProductAddOn = {
      groupName: addOn.groupName,
      addOnValues: inputValue ? [{ sku: inputValue, quantity: selectedQty?.quantity || 0, dontTrackInventory, allowBackOrdering }] : [],
    };
    const newAddons = addons.filter((x) => x.groupName !== addOn.groupName);
    if (inputValue !== "0" && addOnValuesArray.addOnValues && addOnValuesArray.addOnValues.length > 0) newAddons.push(addOnValuesArray);
    setSelectedAddons(newAddons);
    if (selectedQty?.quantity === 0 && !dontTrackInventory && !allowBackOrdering) {
      setValidationMessage(addonTranslations("productOutOfStock"));
      setAddOnValidation({ [`${addOn.groupName}`]: addonTranslations("productOutOfStock") });
      setIsAddToCart(true);
    } else {
      setIsAddToCart(false);
      setValidationMessage("");
      setAddOnValidation({ [`${addOn.groupName}`]: "" });
    }

    addOnValuesArray && addOnValuesArray.addOnValues && addOnValuesArray.addOnValues.length > 0 ? setAddOnDropdownErrorShow(false) : setAddOnDropdownErrorShow(true);

    return inputValue;
  }

  useEffect(() => {
    setDefaultSelected(null);
    const isDefault = selectedAddons.find((addOnData) => addOnData.groupName?.toLowerCase() === addOn.groupName?.toLowerCase());
    if (isDefault?.addOnValues && isDefault.addOnValues.length > 0) {
      setAddOnDropdownErrorShow(false);
      setDefaultSelected(isDefault.addOnValues[0]);
    }
    setValidationMessage(addOnValidation[`${addOn.groupName}`]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnValidation, selectedAddons]);

  const renderOptionAddOnValues = () => {
    return (
      addOnValues &&
      addOnValues.map((addOnValue: IProductAddOnValues, i: number) => {
        const price: number = addOnValue.salesPrice ? addOnValue.salesPrice : addOnValue.retailPrice || 0;
        return (
          <option key={i} selected={addOnValue.sku === defaultSelected?.sku} value={addOnValue?.sku} data-test-selector={`optionAddOn${addOnValue.publishProductId}`}>
            {addOnValue?.name}
            <div>
              {isLoginToSeePricing && !user ? (
                ""
              ) : (
                <div>
                  (+
                  <FormatPriceWithCurrencyCode price={price} currencyCode={currencyCode} />)
                </div>
              )}
            </div>
          </option>
        );
      })
    );
  };

  return (
    addOnValues && (
      <>
        <div className="relative sm:max-w-lg">
          <select
            className="appearance-none w-full h-10 max-w-full sm:max-w-lg px-1 pb-1 text-sm border-b separator"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleAddOnChange(e)}
            data-test-selector="selectAddOnValues"
            id="add-on-values"
            aria-label="Select Addon"
          >
            <option value="" data-test-selector="optionAddOn-0" selected={selectedAddons?.length === 0}>
              {commonTranslations("select")}
            </option>
            {renderOptionAddOnValues()}
          </select>
          <div className="absolute inset-y-0 right-0.5 flex items-center pointer-events-none" data-test-selector={formatTestSelector("divAddOnDropdownIcon", `${addOn.groupName}`)}>
            <ZIcons name="chevron-down" data-test-selector="svgPageArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
          </div>
        </div>
        {isAddOnDropdownErrorShow && shouldShowError && (
          <ValidationMessage
            customClass="text-sm text-errorColor"
            message={addonTranslations("addonIsRequired", { name: addOn.groupName })}
            dataTestSelector={formatTestSelector("AddOnError", `${addOn.groupName}`)}
          />
        )}
        <ValidationMessage message={validationMessage} dataTestSelector={formatTestSelector("addOnValidation", `${addOn.groupName}`)} />
      </>
    )
  );
};
