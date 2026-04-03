import Button from "../../common/button/Button";
import { Heading } from "../../common/heading";
import React from "react";
import { useModal } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

function PasswordReset({ onAction }: { onAction: () => void }) {
  const { closeModal } = useModal();
  const commonTranslation = useTranslationMessages("Common");
  const accountUserTranslation = useTranslationMessages("MyAccount");

  return (
    <section className="sm:w-96 xs:w-full">
      <Heading name={accountUserTranslation("resetPasswordText")} customClass="uppercase mb-2" dataTestSelector="hdgResetPassword" />
      <p className="my-3">{accountUserTranslation("confirmationMessageResetPassword")}</p>
      <div className="mt-5 text-right xs:text-center sm:text-right">
        <Button type="primary" size="small" className="px-6 mr-5" dataTestSelector="btnResetPasswordSave" ariaLabel="save button" onClick={onAction}>
          {commonTranslation("ok")}
        </Button>
        <Button type="secondary" size="small" className="px-6" dataTestSelector="btnResetPasswordCancel" onClick={closeModal} ariaLabel="cancel button">
          {commonTranslation("cancel")}
        </Button>
      </div>
    </section>
  );
}

export default PasswordReset;
