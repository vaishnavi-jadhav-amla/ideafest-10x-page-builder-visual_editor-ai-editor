import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { IConfirmRoleModalProps } from "@znode/types/checkout";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../stores/user-store";

const ConfirmRoleModal: React.FC<IConfirmRoleModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { user } = useUser();
  const checkoutTranslations = useTranslationMessages("Checkout");
  const commonTranslations = useTranslationMessages("Common");

  if (!isOpen) return null;

  return (
    <div className="max-w-[350px]" data-test-selector="divConfirmationPopup">
      <Heading name={checkoutTranslations("confirmationTitle")} level="h2" dataTestSelector="hdgConfirmation" customClass="mt-0" showSeparator />
      <p className="mb-6">{user?.roleName === "User" ? checkoutTranslations("userMessage") : checkoutTranslations("managerMessage")}</p>
      <div className="flex justify-end gap-2">
        <Button
          onClick={onClose}
          type="primary"
          className="btn btn-secondary uppercase tracking-wider text-sm"
          dataTestSelector="btnBack"
          showLoadingText={true}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
        >
          {commonTranslations("back")}
        </Button>
        <Button type="primary" data-test-selector="btnOK" className="btn btn-primary uppercase tracking-wider text-sm px-3 w-16" dataTestSelector="btnOk" onClick={onConfirm}>
          {commonTranslations("ok")}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmRoleModal;
