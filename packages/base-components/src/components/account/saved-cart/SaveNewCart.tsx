"use client";

import { ORDER_DATA_TYPE, TARGET_ORDER_DATA_TYPE } from "@znode/constants/order";
import React, { ChangeEvent, useState } from "react";
import { getCookie, useTranslationMessages } from "@znode/utils/component";
import { useModal, useProduct, useToast } from "../../../stores";

import Button from "../../common/button/Button";
import { INPUT_REGEX } from "@znode/constants/regex";
import { Input } from "../../common/input";
import { create } from "../../../http-request/cart/create";
import { useRouter } from "next/navigation";

export const SaveNewCart: React.FC = () => {
  const savedCartTranslation = useTranslationMessages("SavedCart");
  const commonTranslation = useTranslationMessages("Common");
  const [cartNameError, setCartNameError] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success } = useToast();
  const { closeModal } = useModal();
  const { updateCartCount } = useProduct();

  const saveNewCart = async () => {
    const templateName = inputValue;
    const alphanumericRegex = INPUT_REGEX.ALPHA_NUMERIC_SPACE_CHARACTER_REGEX;
    if (templateName) {
      if (alphanumericRegex.test(templateName)) {
        if (!(templateName.length > 100)) {
          setLoading(true);
          try {
            const cartNumber = getCookie("CartNumber");
            const status = await create({
              orderType: ORDER_DATA_TYPE.SAVED_CARTS,
              templateName: templateName,
              cartNumber: cartNumber,
              targetClassType: TARGET_ORDER_DATA_TYPE.SAVED_CARTS,
            });
            if (status?.errorMessage) {
              setCartNameError(savedCartTranslation("savedCartNameExist"));
              setLoading(false);
            } else if (status.isSuccess) {
              success(savedCartTranslation("successSavedCart"));
              updateCartCount(0);
              closeModal();
              router.push("/account/saved-cart/list");
              setLoading(false);
            }
          } catch (error) {
            setLoading(false);
            setCartNameError(savedCartTranslation("savedCartNameExist"));
          }
        } else {
          setCartNameError(savedCartTranslation("errorSavedCartName"));
        }
      } else {
        setCartNameError(savedCartTranslation("onlyAlphaNumericAllowed"));
      }
    } else {
      setCartNameError(savedCartTranslation("noCart"));
    }
  };

  return (
    <>
      <div className="mb-5">
        <Input
          className="px-2 py-1 xs:w-full"
          placeholder=""
          id="save-cart-name"
          dataTestSelector="txtSaveCartName"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          isLabelShow={true}
          label={savedCartTranslation("saveCartName")}
          isRequired={true}
          labelCustomClass="font-semibold"
        />
        <p className="text-red-500" data-test-selector="paraSaveCartNameError">
          {cartNameError}
        </p>
      </div>
      <div className="text-right xs:text-center sm:text-right">
        <Button type="secondary" size="small" dataTestSelector="btnSaveNewCartCancel" onClick={() => closeModal()} ariaLabel="new cart cancel button">
          {commonTranslation("cancel")}
        </Button>
        <Button
          type="primary"
          size="small"
          className="ml-3"
          dataTestSelector="btnSaveNewCart"
          onClick={() => saveNewCart()}
          ariaLabel="new cart save button"
          disabled={loading ? true : false}
        >
          {!loading ? commonTranslation("save") : savedCartTranslation("saving")}
        </Button>
      </div>
    </>
  );
};
