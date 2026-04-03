"use client";

import React, { ChangeEvent, WheelEvent, useEffect, useState } from "react";

import { IAttributesDetails } from "@znode/types/product";
import Input from "../../../../common/input/Input";
import { ValidationMessage } from "../../../../common/validation-message";
import { useProduct } from "../../../../../stores/product";
import { useTranslations } from "next-intl";

interface IConfigChildProduct {
  retailPrice: number;
  disablePurchasing: boolean;
  inStockQuantity: number | undefined;
  minQuantity: number;
  maxQuantity: number;
  configProductSku: IAttributesDetails | undefined;
  handleBlurInput: (_arg1: string, _arg2: string | undefined, _arg3: string, _arg4: number, _arg5: number) => void;
  disabled: boolean;
  productId: number;
}

const ConfigurableProductGridInput = ({
  inStockQuantity,
  minQuantity,
  maxQuantity,
  configProductSku,
  retailPrice,
  disablePurchasing,
  handleBlurInput,
  disabled,
  productId,
}: IConfigChildProduct) => {
  const [quantityValidationMessage, setQuantityValidationMessage] = useState("");
  const commonTranslations = useTranslations("Common");
  const productTranslations = useTranslations("Product");
  const getDisableValue = (retailPrice: number, disablePurchasing: boolean, inStockQty: number) => {
    if (disabled || retailPrice <= 0 || (disablePurchasing && (inStockQty ?? 0) <= 0)) {
      return true;
    }
    return false;
  };

    const {
      product: { isGroupProduct },
    } = useProduct();

    const fetchChildProductMessage = () => {
      const productDetails = isGroupProduct.find((item) => item.productId === productId);
      setQuantityValidationMessage(productDetails?.message as string);
    };
    useEffect(() => {
      if (isGroupProduct.length > 0) {
        fetchChildProductMessage();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGroupProduct]);
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, minQuantity: number, maxQuantity: number) => {
    const inputQuantity = event.target.value;
    const isNumeric = /^\d*$/.test(inputQuantity);
    if ((inputQuantity === null || !isNumeric) && inputQuantity.trim() !== "") {
      setQuantityValidationMessage(commonTranslations("enterValidQuantity"));
      handleBlurInput(event.target.value, configProductSku?.attributeValues, commonTranslations("enterValidQuantity"), productId, Number(inStockQuantity));
    } else if ((Number(inputQuantity) === 0 && inputQuantity.trim() !== "") || Number(inputQuantity) > maxQuantity) {
      setQuantityValidationMessage(commonTranslations("selectedQuantityMessage", { minQuantity, maxQuantity }));
      handleBlurInput(
        event.target.value,
        configProductSku?.attributeValues,
        commonTranslations("selectedQuantityMessage", { minQuantity, maxQuantity }),
        productId,
        Number(inStockQuantity)
      );
    } else if (Number(inputQuantity) > Number(inStockQuantity) && disablePurchasing) {
       setQuantityValidationMessage(`${productTranslations("quantityExceedMessage")} (${inStockQuantity || 0}).`);
       handleBlurInput(
         event.target.value,
         configProductSku?.attributeValues,
         `${productTranslations("quantityExceedMessage")} (${inStockQuantity || 0}).`,
         productId,
         Number(inStockQuantity)
       );
    } else {
      setQuantityValidationMessage("");
      handleBlurInput(event.target.value, configProductSku?.attributeValues, "", productId, Number(inStockQuantity));
    }
  };

  return (
    <>
      <Input
        type="number"
        className="text-sm xs:w-20 h-9 px-3 input"
        disabled={getDisableValue(retailPrice, disablePurchasing, Number(inStockQuantity))}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, minQuantity, maxQuantity)}
        onWheel={(e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
        ariaLabel="configured product grid"
        isLabelShow={true}
        id="quantity"
      />
      {quantityValidationMessage && <ValidationMessage message={quantityValidationMessage} dataTestSelector="quantityValidationMessage" customClass="text-sm text-errorColor" />}
    </>
  );
};

export default ConfigurableProductGridInput;
