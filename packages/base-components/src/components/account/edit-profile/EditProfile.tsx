/* eslint-disable max-lines-per-function */
"use client";

import { editProfile, getUserData } from "../../../http-request/account/user/user";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { Heading } from "../../common/heading";
import { INPUT_REGEX } from "@znode/constants/regex";
import { IUserProfileRequestModel } from "@znode/types/account";
import Link from "next/link";
import { LoadingSpinnerComponent } from "../../common/icons";
import { ValidationMessage } from "../../common/validation-message";
import { sanitizeInputValue } from "@znode/utils/common";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "../../../stores/toast";
import { useTranslations } from "next-intl";
import { useUser } from "../../../stores";
import { IUser } from "@znode/types/user";

export const EditProfile = () => {
  const { data: session, update } = useSession();
  const { loadUser } = useUser();
  const router = useRouter();
  const [isStatusCompleted, setIsStatusCompleted] = useState(false);
  const { error, success } = useToast();
  const [userProfileData, setUserProfileData] = useState<IUserProfileRequestModel | null>(null);
  const editProfileMessages = useTranslations("EditProfile");
  const commonMessages = useTranslations("Common");
  const userPasswordMessages = useTranslations("UserPassword");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IUserProfileRequestModel>({ mode: "onChange" });

  const onSubmit = async (user: IUserProfileRequestModel) => {
    setIsStatusCompleted(true);
    const updateDetails = await editProfile({
      isUserExists: true,
      editProfileRequestBody: { ...user, firstName: user.firstName?.trim() || "", lastName: user.lastName?.trim() || "", phoneNumber: user.phoneNumber?.trim() || "" },
    });
    const { userDetails, hasError } = updateDetails || {};
    if (!hasError && userDetails) {
      const { email = "", firstName = "", lastName = "", phoneNumber = "", emailOptIn, smsOptIn } = userDetails;
      const updatedSessionsData = await update({
        ...session,
        user: {
          ...session?.user,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          emailOptIn: !!emailOptIn,
          smsOptIn: !!smsOptIn,
        },
      });
      success(editProfileMessages("successEditProfile"));
      setValue("email", email);
      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("phoneNumber", phoneNumber);
      setValue("emailOptIn", !!emailOptIn);
      setValue("smsOptIn", !!smsOptIn);
      if (updatedSessionsData) loadUser(false, updatedSessionsData.user as IUser);
      else loadUser(true);
    } else {
      error(editProfileMessages("failedEditProfile"));
    }
    setIsStatusCompleted(false);
    return userDetails;
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    const userData = (await getUserData()) as IUserProfileRequestModel;
    if (userData) {
      const { userName, email, firstName, lastName, phoneNumber, emailOptIn, smsOptIn } = userData as IUserProfileRequestModel;
      setUserProfileData(userData);
      setValue("userName", userName);
      setValue("email", email);
      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("phoneNumber", phoneNumber);
      setValue("emailOptIn", emailOptIn);
      setValue("smsOptIn", smsOptIn);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelProfile = () => {
    router.push("/account/dashboard");
  };

  return (
    <>
      <Heading name={editProfileMessages("editProfile")} dataTestSelector="hdgEditProfile" customClass="uppercase" level="h1" showSeparator />
      {isLoading ? (
        <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
      ) : (
        <div className="md:w-1/2" data-test-selector="divEditProfile">
          <form onSubmit={handleSubmit(onSubmit)} method="post">
            <div className="pb-2">
              <div className="pb-2 required" data-test-selector="divUsername">
                <label className="font-semibold" data-test-selector="lblUsername">
                  {editProfileMessages("username")} <strong className="text-errorColor">*</strong>
                </label>
              </div>
              <input
                disabled
                className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                {...register("userName", {
                  required: editProfileMessages("requiredUserName"),
                })}
                defaultValue={userProfileData?.userName}
                data-test-selector="txtUsername"
                placeholder=""
                aria-label={editProfileMessages("username")}
              />
              {errors?.userName && <ValidationMessage message={errors.userName.message} dataTestSelector="requiredUserNameError" />}
            </div>
            <div className="pb-2">
              <div className="pb-2 required" data-test-selector="divFirstName">
                <label className="font-semibold" data-test-selector="lblFirstName">
                  {editProfileMessages("firstName")} <strong className="text-errorColor">*</strong>
                </label>
              </div>
              <input
                type="text"
                className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                {...register("firstName", {
                  required: editProfileMessages("requiredFirstName"),
                  //TODO:regex validation according to 9x for now
                  // pattern={{ value: INPUT_REGEX.ALPHA_NUMERIC_CHARACTER_REGEX, message: addressTranslation("onlyAlphaNumericAllowed") }}
                  maxLength: {
                    value: 100,
                    message: editProfileMessages("firstNameLengthExceeded"),
                  },
                  validate: (value: string) => sanitizeInputValue(value, editProfileMessages("requiredFirstName")),
                })}
                defaultValue={userProfileData?.firstName}
                placeholder=""
                data-test-selector="txtFirstName"
                aria-label={editProfileMessages("firstName")}
              />
              {errors?.firstName && <ValidationMessage message={errors.firstName.message} dataTestSelector="requiredFirstNameError" />}
            </div>
            <div className="pb-2">
              <div className="pb-2 required" data-test-selector="divLastName">
                <label className="font-semibold" data-test-selector="lblLastName">
                  {editProfileMessages("lastName")} <strong className="text-errorColor">*</strong>
                </label>
              </div>
              <input
                className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                {...register("lastName", {
                  required: editProfileMessages("requiredLastName"),
                  //TODO:regex validation according to 9x for now
                  // pattern={{ value: INPUT_REGEX.ALPHA_NUMERIC_CHARACTER_REGEX, message: addressTranslation("onlyAlphaNumericAllowed") }}
                  maxLength: {
                    value: 100,
                    message: editProfileMessages("lastNameLengthExceeded"),
                  },
                  validate: (value: string) => sanitizeInputValue(value, editProfileMessages("requiredLastName")),
                })}
                defaultValue={userProfileData?.lastName}
                placeholder=""
                data-test-selector="txtLastName"
                aria-label={editProfileMessages("lastName")}
              />
              {errors?.lastName && <ValidationMessage message={errors.lastName.message} dataTestSelector="requiredLastNameError" />}
            </div>
            <div className="pb-2">
              <div className="pb-2 required" data-test-selector="divPhoneNumber">
                <label className="font-semibold" data-test-selector="lblPhoneNumber">
                  {editProfileMessages("phoneNumber")}
                </label>
              </div>
              <input
                type="text"
                className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                {...register("phoneNumber")}
                defaultValue={userProfileData?.phoneNumber}
                placeholder=""
                data-test-selector="txtPhoneNumber"
                aria-label={editProfileMessages("phoneNumber")}
              />
              <div className="py-2 text-sm">{editProfileMessages("phoneNumberFormat")}</div>
            </div>
            <div className="pb-2">
              <div className="pb-2 required" data-test-selector="divEmailAddress">
                <label className="font-semibold" data-test-selector="lblEmailAddress">
                  {editProfileMessages("emailAddress")} <strong className="text-errorColor">*</strong>
                </label>
              </div>
              <input
                className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                {...register("email", {
                  required: editProfileMessages("requiredEmailAddress"),
                  pattern: { value: INPUT_REGEX.EMAIL_REGEX, message: editProfileMessages("emailPatternMessage") },
                  maxLength: {
                    value: 256,
                    message: editProfileMessages("emailLengthExceeded"),
                  },
                })}
                defaultValue={userProfileData?.email}
                placeholder=""
                data-test-selector="txtEmailAddress"
                aria-label={editProfileMessages("emailAddress")}
              />

              {errors?.email && <ValidationMessage message={errors.email.message} dataTestSelector="requiredEmailError" />}
            </div>
            <div className="pb-2 text-right">
              <Link className="text-linkColor hover:text-hoverColor text-sm underline" href="/account/change-password" data-test-selector="linkChangePassword">
                {editProfileMessages("changePassword")}
              </Link>
            </div>
            <div className="pb-2">
              <label className="font-semibold">
                <input type="checkbox" className="w-4 h-4 border border-inputColor" data-test-selector="chkSendPeriodicEmail" {...register("emailOptIn")} />

                <span className="ml-2" data-test-selector="spnSendPeriodicEmailLabel">
                  {editProfileMessages("sendPeriodicEmailSpecialOffers")}
                </span>
              </label>
            </div>
            <div className="pb-2">
              <label className="font-semibold">
                <input type="checkbox" className="w-4 h-4 border border-inputColor" data-test-selector="chkReceiveSMSNotification" {...register("smsOptIn")} />
                <span className="ml-2" data-test-selector="spnReceiveSMSNotificationLabel">
                  {editProfileMessages("receiveSMSNotification")}
                </span>
              </label>
            </div>
            <div className="flex items-center justify-end pb-2 mt-3">
              <Button
                htmlType="submit"
                type="primary"
                size="small"
                dataTestSelector="btnUpdateProfile"
                ariaLabel={editProfileMessages("updateProfileButton")}
                loading={isStatusCompleted}
                loaderColor="currentColor"
                showLoadingText={true}
                loaderText={commonMessages("loading")}
                loaderHeight="20"
                loaderWidth="20"
              >
                {editProfileMessages("updateProfile")}
              </Button>
              <Button type="secondary" size="small" className="ml-3" dataTestSelector="btnCancel" ariaLabel={userPasswordMessages("cancelButton")} onClick={cancelProfile}>
                {commonMessages("cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default EditProfile;
