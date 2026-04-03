"use client";

import React, { useState } from "react";
import { useModal, useToast } from "../../../stores";

import Button from "../../common/button/Button";
import { Heading } from "../../common/heading";
import { SavedCartConfirmDeleteProps } from "@znode/types/account";
import { deleteSavedCart } from "../../../http-request/account/saved-cart";
import { useTranslationMessages } from "@znode/utils/component";

export const SavedCartConfirmDelete = ({ templateId, updatedSaveCartList, setIsSelectAllChecked, setSelectedRowKeys }: SavedCartConfirmDeleteProps) => {
  const savedCartTranslation = useTranslationMessages("SavedCart");
  const commonTranslation = useTranslationMessages("Common");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error } = useToast();
  const { closeModal } = useModal();

  const deleteSavedCartFunction = async () => {
    let status = false;
    setIsLoading(true);
    if (templateId && templateId.length === 1) {
      const classNumber = templateId[0];
      status = await deleteSavedCart(classNumber || "");
    } else {
      const classNumber = templateId?.join(",");
      status = await deleteSavedCart(classNumber || "");
    }
    if (status && updatedSaveCartList) {
      setIsSelectAllChecked && setIsSelectAllChecked(false);
      success(savedCartTranslation("recordsDeletedSuccessfully"));
      updatedSaveCartList();
      setSelectedRowKeys && setSelectedRowKeys([]);
      setIsLoading(false);
    } else {
      error(savedCartTranslation("recordsDeleteFailMessage"));
      setIsLoading(false);
    }
    closeModal();
  };

  return (
    <div data-test-selector="divSavedDeleteCart">
      <Heading name={savedCartTranslation("confirmDeleteHeading")} showSeparator dataTestSelector="hdgConfirmDelete" />
      <div>{savedCartTranslation("saveCartConfirmDeleteMessage")}</div>
      <div className="flex justify-end pb-2 mt-3">
        <Button
          type="primary"
          size="small"
          loading={isLoading}
          showLoadingText={true}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
          dataTestSelector="btnSaveCart"
          htmlType="submit"
          onClick={() => deleteSavedCartFunction()}
          ariaLabel="save cart OK button"
        >
          {commonTranslation("ok")}
        </Button>
        <Button
          type="secondary"
          size="small"
          dataTestSelector="btnCancelSaveCart"
          className="btn btn-secondary uppercase tracking-wider text-sm ml-3"
          onClick={() => closeModal()}
          ariaLabel="save cart cancel button"
        >
          {commonTranslation("cancel")}
        </Button>
      </div>
    </div>
  );
};
