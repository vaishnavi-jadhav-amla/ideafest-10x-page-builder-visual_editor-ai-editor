"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useModal, useToast } from "../../../stores";

import Button from "../../common/button/Button";
import Heading from "../../common/heading/Heading";
import { deleteOrderTemplates } from "../../../http-request/account/order-template";
import { useTranslationMessages } from "@znode/utils/component";

interface orderTemplateConfirmDeleteProps {
  templateIds: string[];
  updatedOrderTemplateList?: () => void;
  setIsSelectAllChecked: Dispatch<SetStateAction<boolean>>;
  setSelectedRowKeys?: Dispatch<SetStateAction<string[]>>;
}

const OrderTemplateConfirmDelete = ({ templateIds, updatedOrderTemplateList, setIsSelectAllChecked, setSelectedRowKeys }: orderTemplateConfirmDeleteProps) => {
  const orderTemplateTranslation = useTranslationMessages("OrderTemplates");
  const commonTranslation = useTranslationMessages("Common");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error } = useToast();
  const { closeModal } = useModal();
  const deleteOrderTemplate = async () => {
    let status = false;
    setIsLoading(true);

    if (templateIds.length === 1) {
      const classNumber = templateIds[0];
      status = await deleteOrderTemplates(classNumber);
    } else {
      const classNumber = templateIds?.join(",");
      status = await deleteOrderTemplates(classNumber);
    }
    if (status && updatedOrderTemplateList) {
      setIsSelectAllChecked(false);
      success(orderTemplateTranslation("recordsDeletedSuccessfully"));
      updatedOrderTemplateList();
      setSelectedRowKeys && setSelectedRowKeys([]);
      setIsLoading(false);
    } else {
      error(orderTemplateTranslation("recordsDeleteFailMessage"));
      setIsLoading(false);
    }
    closeModal();
  };

  return (
    <div data-test-selector="divOrderTemplateDelete">
      <div className="mb-5">
        <Heading name={orderTemplateTranslation("confirmDeleteHeading")} dataTestSelector="hdgConfirmDelete" />
      </div>
      <div className="pb-5" data-test-selector="divConfirmDeleteText">
        {orderTemplateTranslation("confirmDeleteRecords")}
      </div>
      <div className="pb-2 flex items-center justify-end">
        <Button
          htmlType="submit"
          type="primary"
          size="small"
          dataTestSelector="btnDelete"
          className="btn btn-primary px-5"
          onClick={() => deleteOrderTemplate()}
          ariaLabel="order template OK button"
          loading={isLoading}
          showLoadingText={true}
          loaderColor="currentColor"
          loaderHeight="20px"
          loaderWidth="20px"
        >
          {commonTranslation("ok")}
        </Button>
        <Button dataTestSelector="btnCancel" size="small" className="btn btn-secondary ml-3" onClick={() => closeModal()} ariaLabel="order template cancel button">
          {commonTranslation("cancel")}
        </Button>
      </div>
    </div>
  );
};
export default OrderTemplateConfirmDelete;
