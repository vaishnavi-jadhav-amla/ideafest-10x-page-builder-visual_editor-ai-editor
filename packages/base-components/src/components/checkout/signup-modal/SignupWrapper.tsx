"use client";

import React, { useEffect, useState } from "react";

import { IUserSignUp } from "@znode/types/user";
import { LoaderComponent } from "../../common/loader-component";
import { RegisterUserWithEmailVerification } from "../../register/register-with-email";
import { RegisterUserWithoutEmailVerification } from "../../register/register-without-email";
import { UserVerificationTypeEnum } from "@znode/types/enums";
import { getUserSettings } from "../../../http-request";
import { useModal } from "../../../stores";

interface ISignupWrapperParams {
  onRegistrationComplete: (_arg: boolean) => void;
}

const SignupWrapper: React.FC<ISignupWrapperParams> = ({ onRegistrationComplete }) => {
  const [userSetting, setUserSetting] = useState<IUserSignUp>();
  const { closeModal } = useModal();

  const getPortalDetails = async () => {
    const userSettings = await getUserSettings();
    setUserSetting(userSettings);
  };

  useEffect(() => {
    getPortalDetails();
  }, []);

  const closePopUpModal = () => {
    closeModal();
  };

  if (!userSetting) {
    return (
      <div className="p-5">
        <LoaderComponent isLoading={true} />
      </div>
    );
  }

  const isNoVerificationOrAdminApproval =
    userSetting?.userVerificationTypeCode === UserVerificationTypeEnum.NoVerificationCode || userSetting?.userVerificationTypeCode === UserVerificationTypeEnum.AdminApprovalCode;

  return (
    <div>
      {userSetting?.userVerificationTypeCode === UserVerificationTypeEnum.EmailVerificationCode ? (
        <RegisterUserWithEmailVerification
          isCheckoutAsGuest={true}
          handleCancel={closePopUpModal}
          onRegistrationComplete={onRegistrationComplete}
          isFromCheckout={true}
          attributes={[]}
        />
      ) : isNoVerificationOrAdminApproval ? (
        <RegisterUserWithoutEmailVerification
          isCheckoutAsGuest={true}
          handleCancel={closePopUpModal}
          onRegistrationComplete={onRegistrationComplete}
          isFromCheckout={true}
          storeCode={userSetting.storeCode}
        />
      ) : null}
    </div>
  );
};

export default SignupWrapper;
