"use client";

import Button from "../../common/button/Button";
import React from "react";
import { useModal } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

interface IAccountAction {
  enable: boolean;
  onAction: () => void;
}

function AccountAction({ enable, onAction }: IAccountAction) {
  const { closeModal } = useModal();
  const commonTranslation = useTranslationMessages("Common");
  const accountUserTranslation = useTranslationMessages("MyAccount");
  return (
    <div>
      <div className="sm:w-96 xs:w-full">
        <div className="mb-2">
          <div className="py-2 mb-3 text-base font-semibold text-left uppercase border-b-2 border-gray-400" data-test-selector="divEnableDisableHeading">
            {commonTranslation("pleaseConfirm")}
          </div>
        </div>
        <div data-test-selector="divConfirmationMessage" className="pl-1 mb-3">
          {enable ? accountUserTranslation("enableConfirmationMessage") : accountUserTranslation("disableConfirmationMessage")}
        </div>
        <div className="pt-3 mt-5 text-right xs:text-center sm:text-right">
          <Button type="primary" size="small" className="px-6 mr-5" dataTestSelector="btnOk" ariaLabel="save button" onClick={onAction}>
            {commonTranslation("ok")}
          </Button>
          <Button type="secondary" size="small" className="px-6" dataTestSelector="btnCancel" onClick={() => closeModal()} ariaLabel="cancel button">
            {commonTranslation("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AccountAction;
