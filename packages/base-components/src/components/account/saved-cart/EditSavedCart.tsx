"use client";

import { ISavedCartItems, ISavedCartTemplate } from "@znode/types/account";
import React, { ChangeEvent, useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { EditSavedCartRow } from "./EditSavedCartRow";
import { Heading } from "../../common/heading";
import { INPUT_REGEX } from "@znode/constants/regex";
import { Input } from "../../common/input";
import { LoadingSpinnerComponent } from "../../common/icons";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { ValidationMessage } from "../../common/validation-message";
import { editSaveCartName } from "../../../http-request/account/saved-cart/edit-saved-cart-name";
import { getSavedCartItems } from "../../../http-request/account/saved-cart";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

export const EditSavedCart = ({ classNumber }: { classNumber: string }) => {
  const savedCartTranslation = useTranslationMessages("SavedCart");
  const commonTranslation = useTranslationMessages("Common");

  const router = useRouter();
  const [templateInfo, setTemplateInfo] = useState<ISavedCartTemplate>();
  const [showSavedCartRow, setShowSavedCartRow] = useState<boolean>(false);
  const [inputSavedCartName, setInputSavedCartName] = useState<string>("");
  const [cartNameError, setCartNameError] = useState<string>("");
  const { success } = useToast();

  const getTemplateDetails = async () => {
    const templateData = await getSavedCartItems(classNumber);
    if (templateData) {
      setTemplateInfo(templateData);
      templateData?.className && setInputSavedCartName(templateData?.className);
      if (templateData && templateData?.itemList) setShowSavedCartRow(true);
    } else {
      router.push("/404");
    }
  };

  useEffect(() => {
    getTemplateDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editSavedCartName = async (event: ChangeEvent<HTMLInputElement>) => {
    const className = event.target.value.trim();
    const cartNumber = classNumber;
    const originalClassName = templateInfo?.className?.trim();
    const alphanumericRegex = INPUT_REGEX.ALPHA_NUMERIC_SPACE_CHARACTER_REGEX;
    if (!className) {
      setCartNameError(savedCartTranslation("noCart"));
      return;
    }
    if (className === originalClassName) {
      setCartNameError("");
      return;
    }
    if (!alphanumericRegex.test(className)) {
      setCartNameError(savedCartTranslation("onlyAlphaNumericAllowed"));
      return;
    }
    if (className.length > 100) {
      setCartNameError(savedCartTranslation("errorSavedCartName"));
      return;
    }
    const updateSavedCartName = {
      cartNumber: cartNumber,
      className: className,
      classType: ORDER_DATA_TYPE.SAVED_CARTS,
    };
    const status = await editSaveCartName(updateSavedCartName as ISavedCartItems);
    if (status.isSuccess) {
      success(savedCartTranslation("successEditSavedCart"));
      setCartNameError("");
      getTemplateDetails();
    } else {
      setCartNameError(savedCartTranslation("savedCartNameExist"));
    }
  };

  return (
    <>
      <div className="flex justify-between items-center separator-xs mt-0">
        <Heading name={savedCartTranslation("editSavedCart")} level="h2" dataTestSelector="hdgEditSavedCart" customClass="uppercase" />
        <Button size="small" type="primary" dataTestSelector="btnBack" onClick={() => router.push("/account/saved-cart/list")} ariaLabel="back button">
          {commonTranslation("back")}
        </Button>
      </div>

      <div className="separator-xs pb-3 mb-4">
        <Input
          className="border border-inputColor hover:border-black active:border-black
             px-2 py-1 w-full sm:w-1/2 xl:w-1/4"
          placeholder=""
          type="text"
          defaultValue={templateInfo?.className}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInputSavedCartName(event.target.value)}
          onBlur={(event: ChangeEvent<HTMLInputElement>) => editSavedCartName(event)}
          aria-label="Cart Name"
          isLabelShow={true}
          label={savedCartTranslation("saveCartName")}
          isRequired={true}
          id="cart-name"
          labelCustomClass="font-semibold"
          labelDataTestSelector="lblSavedCartName"
          dataTestSelector="txtSavedCartName"
        />
        <ValidationMessage customClass="text-errorColor" message={cartNameError} dataTestSelector="saveCartNameError" />
      </div>
      <div>
        {showSavedCartRow && templateInfo ? (
          <EditSavedCartRow templateData={templateInfo} className={inputSavedCartName} getTemplateDetails={getTemplateDetails} />
        ) : (
          <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
        )}
      </div>
    </>
  );
};
