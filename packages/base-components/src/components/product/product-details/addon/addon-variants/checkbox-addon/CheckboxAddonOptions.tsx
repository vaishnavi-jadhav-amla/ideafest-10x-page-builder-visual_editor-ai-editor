
"use client";

import { IAttributeDetails, IBaseAttribute } from "@znode/types/attribute";
import { INVENTORY, PRODUCT } from "@znode/constants/product";
import { IProductAddOn, IProductAddOnValues } from "@znode/types/product";
import React, { ChangeEvent } from "react";
import { useProduct, useUser } from "../../../../../../stores";

import { FormatPriceWithCurrencyCode } from "../../../../../common/format-price";
import { IAddonProps } from "@znode/types/product-details";
import Input from "../../../../../common/input/Input";
import { getAttributeValue } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";

const AddOnCheckboxTypeOptions = ({ addOnValueData, addOn, setAddOnCheckboxErrorShow, setValidationMessage, currencyCode, isLoginToSeePricing }: IAddonProps) => {
  const { product, setSelectedAddons, setIsAddToCart, setAddOnValidation } = useProduct();
  const { user } = useUser();
  const { selectedAddons } = product;
  const addonTranslations = useTranslationMessages("Addon");
  const price: number = addOnValueData.salesPrice ? addOnValueData.salesPrice : addOnValueData.retailPrice || 0;

  function handleAddOnChange(event: ChangeEvent<HTMLInputElement>, sku: string, quantity: number, attributes: IBaseAttribute[]) {
    const addons: IProductAddOn[] = selectedAddons && selectedAddons.length > 0 ? [...selectedAddons] : [];
    const inventoryStatus = getAttributeValue(attributes as IAttributeDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues");
    const dontTrackInventory = inventoryStatus === INVENTORY.DONT_TRACK_INVENTORY || false;
    const allowBackOrdering = inventoryStatus === INVENTORY.ALLOW_BACK_ORDERING || false;
    const addOnValuesArray: IProductAddOn = addons?.find((x) => x?.groupName?.toLowerCase() === addOn?.groupName?.toLowerCase()) || { groupName: addOn.groupName, addOnValues: [] };
    if (event.target.checked && sku && addOnValuesArray?.addOnValues && !addOnValuesArray?.addOnValues?.some((x) => x.sku === sku)) {
      addOnValuesArray.addOnValues?.push({ sku, quantity, dontTrackInventory, allowBackOrdering });
    } else if (!event.target.checked && addOnValuesArray?.addOnValues && sku && addOnValuesArray?.addOnValues?.some((x) => x.sku === sku)) {
      addOnValuesArray.addOnValues = addOnValuesArray?.addOnValues?.filter((value) => value.sku !== sku);
    }
    const newAddons = addons.filter((x) => x?.groupName?.toLowerCase() !== addOn?.groupName?.toLowerCase());
    if (addOnValuesArray.addOnValues && addOnValuesArray.addOnValues?.length > 0) newAddons.push(addOnValuesArray);
    setSelectedAddons(newAddons);
    if (addOnValuesArray && addOnValuesArray.addOnValues) {
      addOnValuesArray.addOnValues.length > 0 ? setAddOnCheckboxErrorShow(false) : setAddOnCheckboxErrorShow(true);
      if (validateSelectedAddons(addOnValuesArray.addOnValues || [])) {
        setIsAddToCart(true);
        setValidationMessage(addonTranslations("productOutOfStock"));
        setAddOnValidation({ [`${addOn.groupName}`]: addonTranslations("productOutOfStock") });
      } else {
        setIsAddToCart(false);
        setValidationMessage("");
        setAddOnValidation({ [`${addOn.groupName}`]: "" });
      }
    }
  }

  const validateSelectedAddons = (addonData: IProductAddOnValues[]) => {
    return addonData?.some((item: IProductAddOnValues) => item.quantity === 0 && item.dontTrackInventory === false && item.allowBackOrdering === false) || false;
  };

  return (
    <>
      <Input
        type="checkbox"
        className="form-radio xs:w-4 h-4 accent-accentColor"
        id={`add-on-value-checkbox-${addOnValueData?.publishProductId}`}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleAddOnChange(e, addOnValueData.sku as string, addOnValueData.quantity || 0, addOnValueData?.attributes as IBaseAttribute[])
        }
        checked={
          selectedAddons &&
          selectedAddons
            ?.find((x: IProductAddOn) => x.groupName?.toLowerCase() === addOn?.groupName?.toLowerCase())
            ?.addOnValues?.some((x: IProductAddOnValues) => x.sku === addOnValueData?.sku)
        }
        dataTestSelector={`chkAddOn${addOnValueData?.publishProductId}`}
        ariaLabel={`${addOnValueData?.name} (+$ ${price?.toFixed(2)})`}
      />
      <label
        className="font-semibold cursor-pointer pl-3"
        htmlFor={`add-on-value-checkbox-${addOnValueData?.publishProductId}`}
        data-test-selector={`lblAddOn${addOnValueData?.publishProductId}`}
      >
        {addOnValueData?.name}
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
      </label>
    </>
  );
};

export default AddOnCheckboxTypeOptions;
