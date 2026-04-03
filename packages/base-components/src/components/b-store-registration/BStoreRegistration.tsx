/* eslint-disable max-lines-per-function */
"use client";
import { getUserData } from "../../http-request/account/user/user";
import { IUserProfileRequestModel } from "@znode/types/account";
import { submitBStoreRequestRegistration } from "../../http-request/b-stores/request-registration";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heading } from "../common/heading";
import Button from "../common/button/Button";
import { ValidationMessage } from "../common/validation-message";
import { INPUT_REGEX } from "@znode/constants/regex";
import { sanitizeInputValue } from "@znode/utils/common";
import { useToast } from "../../stores/toast";
import Link from "next/link";
import { IState } from "@znode/types/common";
import { getCountryList, getStateList } from "../../http-request";
import { LoadingSpinnerComponent } from "../common/icons";
import { ICountries } from "@znode/types/address";
import { useAddress } from "../../stores/address";
import { SelectField } from "../common/select";
import { IBStoresRequestRegistrationModel } from "@znode/types/b-stores/request-registration";

export const BStoreRegistration = () => {
  const router = useRouter();
  const { countries, setCountries, stateListData, setStateListData } = useAddress();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { error, success } = useToast();
  const bStoreRegistrationMessages = useTranslations("BStoreRegistration");
  const commonMessages = useTranslations("Common");
  const [isLoading, setIsLoading] = useState(false);
  const [stateList, setStateList] = useState<IState[]>(stateListData);
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [selectedState, setSelectedState] = useState<string>();
  const [userProfileData, setUserProfileData] = useState<IUserProfileRequestModel | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IBStoresRequestRegistrationModel>({ mode: "onChange" });

  const onSubmit = async (data: IBStoresRequestRegistrationModel) => {
    if (!acceptTerms) {
      error(bStoreRegistrationMessages("pleaseAcceptTerms"));
      return;
    }
    data.address = (data.addressLine1 ?? "") + " " + (data.addressLine2 ?? "");

    const countryObj = countries.find((c) => c.countryCode === selectedCountry);
    const stateObj = stateList.find((s) => s.stateCode === selectedState);
    data.countryCode = countryObj ? countryObj.countryCode : "";
    data.countryName = countryObj ? countryObj.countryName : "";
    data.stateCode = stateObj ? stateObj.stateCode : "";
    data.stateName = stateObj ? stateObj.stateName : "";
    setIsSubmitting(true);

    try {
      // Actual API call
      const response = await submitBStoreRequestRegistration(data);
      if (response.isSuccess) {
        success(bStoreRegistrationMessages("registrationSuccessful"));
        router.push("/account/dashboard");
      } else {
        error(bStoreRegistrationMessages("registrationFailed"));
      }
    } catch (err) {
      error(bStoreRegistrationMessages("registrationFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/account/dashboard");
  };

  //Pre-fill data
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userData = (await getUserData()) as IUserProfileRequestModel;
      if (userData) {
        const { email, firstName, lastName, phoneNumber } = userData as IUserProfileRequestModel;
        setUserProfileData(userData);
        setValue("emailAddress", email);
        setValue("firstName", firstName);
        setValue("lastName", lastName);
        setValue("phoneNumber", phoneNumber);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCountriesStateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countries and states fetching
  const fetchCountriesStateData = async () => {
    setIsLoading(true);
    const countryList = await getCountryList();
    if (countryList?.length > 0 && countryList[0].countryCode) {
      setCountries(countryList);
      setSelectedCountry(countryList[0].countryCode);
      fetchStateData(countryList[0].countryCode, countryList);
    }
    setIsLoading(false);
  };

  const fetchStateData = async (countryCode: string, countryList?: ICountries[]) => {
    if (countryCode) {
      const stateList = await getStateList(countryCode);
      setStateList(stateList);
      countryList && countryCode === countryList[0]?.countryCode && setStateListData(stateList);
      if (stateList && stateList.length > 0) {
        setSelectedState(stateList[0].stateCode);
      } else {
        setSelectedState(undefined);
      }
    }
  };

  const renderCountries = () => {
    return (
      countries &&
      countries.map((country: ICountries, index: number) => {
        return (
          <option value={country.countryCode} selected={country.countryCode === selectedCountry} key={`${country.countryId}-${index}`}>
            {country.countryName}
          </option>
        );
      })
    );
  };

  const renderStates = () => {
    return (
      stateList &&
      stateList?.map((state) => {
        return (
          <option value={state.stateCode} selected={state.stateCode === selectedState} key={state.stateId}>
            {state.stateName}
          </option>
        );
      })
    );
  };

  const handleChangeCountry = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountry(code);
    await fetchStateData(code);
    // Optionally set selectedState to first state in new list
    if (stateList && stateList.length > 0) {
      setSelectedState(stateList[0].stateCode);
    } else {
      setSelectedState(undefined);
    }
  };

  const handleChangeState = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  return (
    <>
      <Heading name={bStoreRegistrationMessages("b-store-registration")} dataTestSelector="hdgBStoreRegistration" level="h1" showSeparator />
      <div className="pb-4 text-gray-600" data-test-selector="divRegistrationDescription">
        {bStoreRegistrationMessages("registrationDescription")}
      </div>
      {isLoading ? (
        <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
      ) : (
        <div className="md:w-full max-w-4xl" data-test-selector="divBStoreRegistration">
          <form onSubmit={handleSubmit(onSubmit)} method="post">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {/* First Name */}
              <div className="pb-2">
                <div className="pb-2 required" data-test-selector="divFirstName">
                  <label className="font-semibold" data-test-selector="lblFirstName">
                    {bStoreRegistrationMessages("firstName")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("firstName", {
                    required: bStoreRegistrationMessages("requiredFirstName"),
                    maxLength: {
                      value: 100,
                      message: bStoreRegistrationMessages("firstNameLengthExceeded"),
                    },
                    validate: (value: string | undefined) => sanitizeInputValue(value ?? "", bStoreRegistrationMessages("requiredFirstName")),
                  })}
                  placeholder=""
                  data-test-selector="txtFirstName"
                  aria-label={bStoreRegistrationMessages("firstName")}
                />
                {errors?.firstName && <ValidationMessage message={errors.firstName.message} dataTestSelector="requiredFirstNameError" />}
              </div>

              {/* Last Name */}
              <div className="pb-2">
                <div className="pb-2 required" data-test-selector="divLastName">
                  <label className="font-semibold" data-test-selector="lblLastName">
                    {bStoreRegistrationMessages("lastName")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("lastName", {
                    required: bStoreRegistrationMessages("requiredLastName"),
                    maxLength: {
                      value: 100,
                      message: bStoreRegistrationMessages("lastNameLengthExceeded"),
                    },
                    validate: (value: string | undefined) => sanitizeInputValue(value ?? "", bStoreRegistrationMessages("requiredLastName")),
                  })}
                  placeholder=""
                  data-test-selector="txtLastName"
                  aria-label={bStoreRegistrationMessages("lastName")}
                />
                {errors?.lastName && <ValidationMessage message={errors.lastName.message} dataTestSelector="requiredLastNameError" />}
              </div>

              {/* Email Address */}
              <div className="pb-2">
                <div className="pb-2 required" data-test-selector="divEmailAddress">
                  <label className="font-semibold" data-test-selector="lblEmailAddress">
                    {bStoreRegistrationMessages("emailAddress")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                {userProfileData?.email ? (
                  <>
                    {/* Disabled input for UI */}
                    <input
                      type="email"
                      value={userProfileData.email}
                      disabled
                      className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                      aria-label={bStoreRegistrationMessages("emailAddress")}
                    />

                    {/* Hidden input for RHF submission */}
                    <input type="hidden" {...register("emailAddress")} value={userProfileData.email} />
                  </>
                ) : (
                  <input
                    type="email"
                    className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                    {...register("emailAddress", {
                      required: bStoreRegistrationMessages("requiredEmailAddress"),
                      pattern: {
                        value: INPUT_REGEX.EMAIL_REGEX,
                        message: bStoreRegistrationMessages("emailPatternMessage"),
                      },
                      maxLength: {
                        value: 256,
                        message: bStoreRegistrationMessages("emailLengthExceeded"),
                      },
                    })}
                    placeholder=""
                    data-test-selector="txtEmailAddress"
                    aria-label={bStoreRegistrationMessages("emailAddress")}
                  />
                )}
                {errors?.emailAddress && <ValidationMessage message={errors.emailAddress.message} dataTestSelector="requiredEmailError" />}
              </div>

              {/* Company Name */}
              <div className="pb-2">
                <div className="pb-2" data-test-selector="divCompanyName">
                  <label className="font-semibold" data-test-selector="lblCompanyName">
                    {bStoreRegistrationMessages("companyName")}
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("companyName", {
                    maxLength: {
                      value: 200,
                      message: bStoreRegistrationMessages("companyNameLengthExceeded"),
                    },
                  })}
                  placeholder=""
                  data-test-selector="txtCompanyName"
                  aria-label={bStoreRegistrationMessages("companyName")}
                />
                {errors?.companyName && <ValidationMessage message={errors.companyName.message} dataTestSelector="companyNameError" />}
              </div>

              {/* Address Line 1 */}
              <div className="pb-2 md:col-span-2">
                <div className="pb-2 required" data-test-selector="divAddressLine1">
                  <label className="font-semibold" data-test-selector="lblAddressLine1">
                    {bStoreRegistrationMessages("addressLine1")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("addressLine1", {
                    required: bStoreRegistrationMessages("requiredStreetAddress"),
                    maxLength: {
                      value: 200,
                      message: bStoreRegistrationMessages("streetAddressLengthExceeded"),
                    },
                  })}
                  placeholder=""
                  data-test-selector="txtAddressLine1"
                  aria-label={bStoreRegistrationMessages("addressLine1")}
                />
                {errors?.addressLine1 && <ValidationMessage message={errors.addressLine1.message} dataTestSelector="requiredAddressLine1Error" />}
              </div>

              {/* Address Line 2 */}
              <div className="pb-2 md:col-span-2">
                <div className="pb-2" data-test-selector="divAddressLine2">
                  <label className="font-semibold" data-test-selector="lblAddressLine2">
                    {bStoreRegistrationMessages("addressLine2")}
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("addressLine2", {
                    maxLength: {
                      value: 200,
                      message: bStoreRegistrationMessages("streetAddressLengthExceeded"),
                    },
                  })}
                  placeholder=""
                  data-test-selector="txtAddressLine2"
                  aria-label={bStoreRegistrationMessages("addressLine2")}
                />
                {errors?.addressLine2 && <ValidationMessage message={errors.addressLine2.message} dataTestSelector="requiredAddressLine2Error" />}
              </div>

              {/* City */}
              <div className="pb-2">
                <div className="pb-2 required" data-test-selector="divCity">
                  <label className="font-semibold" data-test-selector="lblCity">
                    {bStoreRegistrationMessages("city")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("cityName", {
                    required: bStoreRegistrationMessages("requiredCity"),
                    maxLength: {
                      value: 100,
                      message: bStoreRegistrationMessages("cityLengthExceeded"),
                    },
                  })}
                  placeholder=""
                  data-test-selector="txtCity"
                  aria-label={bStoreRegistrationMessages("city")}
                />
                {errors?.cityName && <ValidationMessage message={errors.cityName.message} dataTestSelector="requiredCityError" />}
              </div>

              {/* Country */}
              <div className="pb-2">
                <SelectField
                  label={bStoreRegistrationMessages("country")}
                  name="CountryName"
                  aria-label={bStoreRegistrationMessages("country")}
                  options={renderCountries()}
                  data-test-selector="ddlCountry"
                  onChange={handleChangeCountry}
                />
                {errors?.countryName && <ValidationMessage message={errors.countryName.message} dataTestSelector="requiredCountryError" />}
              </div>

              {/* State */}
              <div className="pb-2">
                <SelectField
                  label={bStoreRegistrationMessages("state")}
                  name="StateName"
                  aria-label={bStoreRegistrationMessages("state")}
                  options={renderStates()}
                  data-test-selector="ddlState"
                  onChange={handleChangeState}
                />
                {errors?.stateName && <ValidationMessage message={errors.stateName.message} dataTestSelector="requiredStateError" />}
              </div>

              {/* Postal Code */}
              <div className="pb-2">
                <div className="pb-2 required" data-test-selector="divPostalCode">
                  <label className="font-semibold" data-test-selector="lblPostalCode">
                    {bStoreRegistrationMessages("postalCode")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="text"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("postalCode", {
                    required: bStoreRegistrationMessages("requiredPostalCode"),
                    maxLength: {
                      value: 20,
                      message: bStoreRegistrationMessages("postalCodeLengthExceeded"),
                    },
                  })}
                  placeholder=""
                  data-test-selector="txtPostalCode"
                  aria-label={bStoreRegistrationMessages("postalCode")}
                />
                {errors?.postalCode && <ValidationMessage message={errors.postalCode.message} dataTestSelector="requiredPostalCodeError" />}
              </div>

              {/* Phone Number */}
              <div className="pb-2">
                <div className="pb-2 required" data-test-selector="divPhoneNumber">
                  <label className="font-semibold" data-test-selector="lblPhoneNumber">
                    {bStoreRegistrationMessages("phoneNumber")} <strong className="text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="tel"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("phoneNumber", {
                    required: bStoreRegistrationMessages("requiredPhoneNumber"),
                    pattern: {
                      value: /^[\d\s()+-]+$/,
                      message: bStoreRegistrationMessages("phoneNumberPatternMessage"),
                    },
                  })}
                  placeholder=""
                  data-test-selector="txtPhoneNumber"
                  aria-label={bStoreRegistrationMessages("phoneNumber")}
                />
                {errors?.phoneNumber && <ValidationMessage message={errors.phoneNumber.message} dataTestSelector="requiredPhoneNumberError" />}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pb-4 mt-6">
              <label className="flex items-start font-semibold">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 border border-inputColor"
                  data-test-selector="chkAcceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span className="ml-2" data-test-selector="spnAcceptTermsLabel">
                  {bStoreRegistrationMessages("acceptTermsText")}{" "}
                  <Link href="/terms-conditions" className="text-linkColor hover:text-hoverColor underline" target="_blank" data-test-selector="linkTermsConditions">
                    {bStoreRegistrationMessages("termsAndConditions")}
                  </Link>
                </span>
              </label>
              {!acceptTerms && isSubmitting && <ValidationMessage message={bStoreRegistrationMessages("requiredAcceptTerms")} dataTestSelector="requiredAcceptTermsError" />}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end pb-2 mt-6">
              <Button
                htmlType="submit"
                type="primary"
                size="small"
                disabled={!acceptTerms}
                dataTestSelector="btnSubmitRegistration"
                ariaLabel={bStoreRegistrationMessages("submitRegistration")}
                loading={isSubmitting}
                loaderColor="currentColor"
                showLoadingText={true}
                loaderText={commonMessages("loading")}
                loaderHeight="20"
                loaderWidth="20"
              >
                {bStoreRegistrationMessages("submitRegistration")}
              </Button>
              <Button type="secondary" size="small" className="ml-3" dataTestSelector="btnCancel" ariaLabel={commonMessages("cancel")} onClick={handleCancel}>
                {commonMessages("cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default BStoreRegistration;
