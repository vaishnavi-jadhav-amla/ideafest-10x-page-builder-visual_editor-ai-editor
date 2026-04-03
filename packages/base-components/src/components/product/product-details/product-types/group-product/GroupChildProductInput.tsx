"use client";

import React, { ChangeEvent, WheelEvent, useEffect, useState } from "react";

import { IBaseAttribute } from "@znode/types/attribute";
import Input from "../../../../common/input/Input";
import { ValidationMessage } from "../../../../common/validation-message";
import { useProduct } from "../../../../../stores/product";
import { useTranslations } from "next-intl";

interface IGroupChildProduct {
  retailPrice: number;
  disablePurchasing: boolean;
  inStockQuantity: number | undefined;
  minQuantity: number;
  maxQuantity: number;
  groupProductSKU: IBaseAttribute | undefined;
  handleBlurInput: (_arg1: ChangeEvent<HTMLInputElement>, _arg2: string | undefined, _arg3: string, _arg4: number, _arg5: number) => void;
  disabled?: boolean;
  emptyInput: boolean;
  setInputField: (_state: boolean) => void;
  publishProductId: number;
}

const GroupChildProductInput = ({
  retailPrice,
  disablePurchasing,
  inStockQuantity,
  minQuantity,
  maxQuantity,
  groupProductSKU,
  handleBlurInput,
  disabled,
  emptyInput,
  setInputField,
  publishProductId,
}: IGroupChildProduct) => {
  const [quantityValidationMessage, setQuantityValidationMessage] = useState("");
  const [value, setValue] = useState<string | number>("");
  const commonTranslations = useTranslations("Common");
  const productTranslations = useTranslations("Product");
  const {
    product: { isGroupProduct },
  } = useProduct();

  const fetchChildProductMessage = () => {
    const xx = isGroupProduct.find((item) => item.productId === publishProductId);
    setQuantityValidationMessage(xx?.message as string);
  };
  useEffect(() => {
    if (isGroupProduct.length > 0) {
      fetchChildProductMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGroupProduct]);

  useEffect(() => {
    if (emptyInput) {
      setValue("");
      setInputField(false);
    }
    return () => setValue("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emptyInput]);

  const getDisableValue = (retailPrice: number, disablePurchasing: boolean, inStockQty: number | undefined) => {
    if (disabled || retailPrice < 0 || (disablePurchasing && (inStockQty ?? 0) <= 0)) {
      return true;
    }
    return false;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, minQuantity: number, maxQuantity: number) => {
    const inputQuantity = event.target.value;
    const isNumeric = /^\d*$/.test(inputQuantity);
    setValue(inputQuantity);
    if ((inputQuantity === null || !isNumeric) && inputQuantity.trim() !== "") {
      setQuantityValidationMessage(commonTranslations("enterValidQuantity"));
      handleBlurInput(event, groupProductSKU?.attributeValues as string, commonTranslations("enterValidQuantity"), publishProductId, Number(inStockQuantity));
    } else if ((Number(inputQuantity) === 0 && inputQuantity.trim() !== "") || Number(inputQuantity) > maxQuantity) {
      setQuantityValidationMessage(commonTranslations("selectedQuantityMessage", { minQuantity, maxQuantity }));
      handleBlurInput(
        event,
        groupProductSKU?.attributeValues as string,
        commonTranslations("selectedQuantityMessage", { minQuantity, maxQuantity }),
        publishProductId,
        Number(inStockQuantity)
      );
    } else if (Number(inputQuantity) > Number(inStockQuantity) && disablePurchasing) {
      setQuantityValidationMessage(`${productTranslations("quantityExceedMessage")} (${inStockQuantity || 0}).`);
      handleBlurInput(
        event,
        groupProductSKU?.attributeValues as string,
        `${productTranslations("quantityExceedMessage")} (${inStockQuantity || 0}).`,
        publishProductId,
        Number(inStockQuantity)
      );
    } else {
      setQuantityValidationMessage("");
      handleBlurInput(event, groupProductSKU?.attributeValues as string, "", publishProductId, Number(inStockQuantity));
    }
  };

  return (
    <>
      <Input
        type="text"
        value={value}
        className="px-3 text-sm xs:w-20 h-9 input"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, minQuantity, maxQuantity)}
        onWheel={(e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
        disabled={getDisableValue(retailPrice, disablePurchasing, inStockQuantity)}
        dataTestSelector="txtQUantityBox"
        ariaLabel="child grid quantity"
      />
      {quantityValidationMessage && <ValidationMessage message={quantityValidationMessage} dataTestSelector="quantityValidationMessage" customClass="text-sm text-errorColor" />}
    </>
  );
};

export default GroupChildProductInput;
