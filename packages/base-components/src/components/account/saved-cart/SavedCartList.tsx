"use client";

import { ISavedCartCollectionDetails, ISavedCartList } from "@znode/types/account";
import { ORDER_DATA_TYPE, TARGET_ORDER_DATA_TYPE } from "@znode/constants/order";
import React, { useEffect, useState } from "react";
import { getCookie, useTranslationMessages } from "@znode/utils/component";
import { useModal, useProduct, useToast } from "../../../stores";

import Button from "../../common/button/Button";
import { Input } from "../../common/input";
import { LoadingSpinner } from "../../common/icons";
import { create } from "../../../http-request/cart/create";
import { getSavedCart } from "../../../http-request/account/saved-cart";
import { useRouter } from "next/navigation";

export const SavedCartList = () => {
  const savedCartTranslation = useTranslationMessages("SavedCart");
  const commonTranslation = useTranslationMessages("Common");
  const [savedCartList, setSavedCartList] = useState<ISavedCartList | null>();
  const [selectedSavedCartClassNumber, setSelectedSavedCartClassNumber] = useState<string>();
  const [selectedSavedCartClassName, setSelectedSavedCartClassName] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();
  const router = useRouter();
  const { closeModal } = useModal();
  const { updateCartCount } = useProduct();

  const fetchSavedCartList = async () => {
    setIsLoading(true);
    try {
      const saveCartList = await getSavedCart();
      setSavedCartList(saveCartList);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCartList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (templateId: string | undefined, className: string | undefined) => {
    setSelectedSavedCartClassNumber(templateId);
    setSelectedSavedCartClassName(className);
  };

  const editSaveCart = async () => {
    const cartNumber = getCookie("CartNumber");
    if (cartNumber) {
      const status = await create({
        orderType: ORDER_DATA_TYPE.SAVED_CARTS,
        cartNumber: cartNumber,
        targetClassNumber: selectedSavedCartClassNumber,
        templateName: selectedSavedCartClassName,
        targetClassType: TARGET_ORDER_DATA_TYPE.SAVED_CARTS,
      });
      if (status.isSuccess) {
        closeModal();
        success(savedCartTranslation("successSavedCart"));
        updateCartCount(0);
        router.push("/account/saved-cart/list");
      } else {
        error(savedCartTranslation("ErrorEditSavedCart"));
      }
    }
  };

  const renderSavedCartList = () => {
    if (Array.isArray(savedCartList?.collectionDetails) && !savedCartList.collectionDetails.length)
      return <div className="font-semibold">{savedCartTranslation("noCartAvailable")}</div>;
    return savedCartList?.collectionDetails?.map((savedCartListData: ISavedCartCollectionDetails, id: number) => {
      return (
        <div className="flex items-center mb-1" key={savedCartListData?.classNumber} data-test-selector={`divSavedCartItem${id}`}>
          <Input
            type="checkbox"
            id={`${savedCartListData?.className}-${savedCartListData?.classNumber}`}
            className="xs:w-4 h-4 accent-black"
            checked={selectedSavedCartClassNumber === savedCartListData?.classNumber}
            onChange={() => handleInputChange(savedCartListData?.classNumber, savedCartListData?.className)}
            ariaLabel="Save Cart Checkbox"
            dataTestSelector={`chkSavedCart${id}`}
          />
          <label
            className="cursor-pointer pl-5 font-semibold"
            htmlFor={`${savedCartListData?.className}-${savedCartListData?.classNumber}`}
            data-test-selector={`lblSavedCart${id}`}
          >
            {savedCartListData?.className}
          </label>
        </div>
      );
    });
  };

  const renderLoader = () => {
    return (
      <div className="flex justify-center">
        <LoadingSpinner width="40px" height="40px" />
      </div>
    );
  };

  return (
    <div>
      <p className="font-semibold mb-3" data-test-selector="paraSelectSavedCartHeading">
        {savedCartTranslation("selectSavedCart")}
      </p>
      <div className="max-h-40 overflow-x-hidden overflow-y-auto mb-5 custom-scroll">{isLoading ? renderLoader() : savedCartList ? renderSavedCartList() : null}</div>{" "}
      <div className="text-right xs:text-center sm:text-right">
        <Button type="secondary" size="small" className="ml-3" dataTestSelector="btnSavedCartCancel" onClick={() => closeModal()} ariaLabel="cart list cancel button">
          {commonTranslation("cancel")}
        </Button>
        <Button
          type="primary"
          size="small"
          className="ml-3"
          dataTestSelector="btnSavedCart"
          disabled={!savedCartList || !selectedSavedCartClassNumber}
          onClick={() => editSaveCart()}
          ariaLabel="cart list save button"
        >
          {commonTranslation("save")}
        </Button>
      </div>
    </div>
  );
};
