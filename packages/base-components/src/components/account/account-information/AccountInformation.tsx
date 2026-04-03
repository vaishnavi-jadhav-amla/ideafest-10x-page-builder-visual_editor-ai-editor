/* eslint-disable max-lines-per-function */
"use client";

import { ICountry, IState } from "@znode/types/common";
import { LoadingSpinnerComponent, ZIcons } from "../../common/icons";
import React, { useEffect, useState } from "react";
import { getAccountInformation, getStateList, updateAccountInformation } from "../../../http-request";
import { isValidZipCode, sanitizeInputValue } from "@znode/utils/common";

import Button from "../../common/button/Button";
import Heading from "../../common/heading/Heading";
import { IAccountAddress } from "@znode/types/account";
import Link from "next/link";
import { SETTINGS } from "@znode/constants/settings";
import { ValidationMessage } from "../../common/validation-message";
import { useForm } from "react-hook-form";
import { useToast } from "../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

export function AccountInformation() {
  const common = useTranslationMessages("Common");
  const account = useTranslationMessages("AccountInformation");
  const defaultValues = {
    accountId: "",
    externalId: 0,
    accountName: "",
    accountPhoneNumber: "",
    displayName: "",
    address1: "",
    address2: "",
    postalCode: 0,
    cityName: "",
    stateName: "",
    countryName: "",
    phoneNumber: 0,
  };
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<IAccountAddress>({ mode: "onChange", defaultValues });
  const { error, success } = useToast();
  const [countriesList, setCountriesList] = useState<ICountry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addressId, setAddressId] = useState();
  const [updateBtn, setUpdateBtn] = useState(false);
  const [stateList, setStateList] = useState<IState[]>([]);
  const [selectedState, setSelectedState] = useState<string>();
  const [isDefaultBilling, setIsDefaultBilling] = useState<boolean>(false);
  const [isDefaultShipping, setIsDefaultShipping] = useState<boolean>(false);

  const postalCodeValidator = async (postalCode: string, countryCode: string) => {
    const isValidCode = await isValidZipCode(postalCode, countryCode);

    setError("postalCode", {
      type: "manual",
      message: isValidCode ? "" : common("validationZipCode"),
    });
    return isValidCode;
  };

  const onSubmit = async (data: IAccountAddress) => {
    setUpdateBtn(true);
    const requestBody = {
      ...data,
      accountName: data?.accountName?.trim(),
      displayName: data?.displayName?.trim(),
      address1: data?.address1?.trim(),
      address2: data?.address2?.trim(),
      cityName: data?.cityName?.trim(),
      addressId: addressId,
      isDefaultBilling: isDefaultBilling,
      isDefaultShipping: isDefaultShipping,
    };

    let isValidPostalCode = true;
    if (data.postalCode && data.countryName) {
      isValidPostalCode = await postalCodeValidator(String(data.postalCode), data.countryName);
    }

    if (isValidPostalCode) {
      const { data, message } = await updateAccountInformation(requestBody);
      if (!data) {
        error(message);
      } else {
        success(account("updateError"));
        fetchAccountInformationData();
      }
    }
    setUpdateBtn(false);
  };

  const fetchAccountInformationData = async () => {
    setIsLoading(true);
    const { data } = await getAccountInformation();
    const userInformation = data;
    if (userInformation.accountData && userInformation.addressDetails && userInformation.countryList) {
      if (userInformation.countryList && userInformation.countryList.length > 0) {
        setCountriesList(userInformation.countryList);
        if (userInformation.countryList[0].countryCode) {
          fetchStateData(userInformation.countryList[0].countryCode);
        }
      }
      const accountDetails = userInformation.accountData;
      const accountAddress = userInformation.addressDetails;
      setIsDefaultBilling(userInformation.addressDetails.isDefaultBilling);
      setIsDefaultShipping(userInformation.addressDetails.isDefaultShipping);
      setAddressId(accountAddress.addressId);
      setSelectedState(accountAddress.stateName);
      reset({
        accountId: accountDetails.accountId,
        externalId: accountDetails.externalId || 0,
        accountName: accountDetails.name,
        accountPhoneNumber: accountDetails.phoneNumber,
        displayName: accountAddress.displayName,
        address1: accountAddress.address1,
        address2: accountAddress.address2,
        postalCode: accountAddress.postalCode,
        cityName: accountAddress.cityName,
        stateName: accountAddress.stateName,
        countryName: accountAddress.countryName,
        phoneNumber: accountAddress.phoneNumber,
      });
      if (accountAddress.countryName) {
        fetchStateData(accountAddress.countryName);
      }
    }
    setIsLoading(false);
  };

  const fetchStateData = async (countryCode: string) => {
    if (countryCode) {
      const stateList = await getStateList(countryCode);
      setStateList(stateList);
    }
  };

  const handleChangeCountry = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    fetchStateData(e.target.value);
  };

  useEffect(() => {
    fetchAccountInformationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCountries = () => {
    return (
      countriesList &&
      countriesList.map((countryData: ICountry) => {
        return (
          <option value={countryData?.countryCode} key={countryData.countryId}>
            {countryData.countryName}
          </option>
        );
      })
    );
  };

  const renderStates = () => {
    return stateList?.map((state: IState) => {
      return (
        <option value={state.stateCode} key={state.stateId} selected={state.stateCode === selectedState}>
          {state.stateName}
        </option>
      );
    });
  };

  return (
    <div className="relative w-full">
      <Heading name={account("accountInformation")} dataTestSelector="hdgAccountInformation" level="h1" customClass="uppercase" showSeparator />
      {isLoading ? (
        <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} method="post">
          <div data-test-selector="divContactInformation">
            <Heading name={account("contactInformation")} dataTestSelector="hdgContactInformation" level="h3" customClass="uppercase" showSeparator />
          </div>
          <div className="grid-cols-2 gap-4 sm:grid">
            <div className="col-span-1">
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblAccountId">
                    {account("accountID")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  data-test-selector="txtAccountId"
                  aria-label="Account Id"
                  disabled
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("accountId")}
                />
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblExternalId">
                    {account("externalID")}
                  </label>
                </div>
                <input
                  data-test-selector="txtExternalId"
                  aria-label="External Id"
                  disabled
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("externalId")}
                />
              </div>
            </div>
            <div className="col-span-1">
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblPhoneNo">
                    {account("phoneNumber")}
                  </label>
                </div>
                <input
                  data-test-selector="txtPhoneNo"
                  aria-label="Account Phone Number"
                  disabled
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("accountPhoneNumber")}
                />
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblAccountName">
                    {account("accountName")}
                  </label>
                </div>
                <input
                  data-test-selector="txtAccountName"
                  aria-label="Account Name"
                  disabled
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("accountName", {
                    validate: (val: string) => {
                      if (val && val.length > 100) {
                        return account("accountNameExceed");
                      }
                    },
                  })}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 mb-1" data-test-selector="divAddress">
            <Heading name={account("address")} dataTestSelector="hdgAddress" level="h3" customClass="uppercase" showSeparator />
          </div>
          <div className="grid-cols-2 gap-4 sm:grid">
            <div className="col-span-1">
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblAddressName">
                    {account("addressName")}
                  </label>
                </div>
                <input
                  data-test-selector="txtDisplayName"
                  aria-label="Display Name"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("displayName", {
                    validate: (val: string) => {
                      if (val && val.length > 100) {
                        return account("addressNameExceed");
                      }
                    },
                  })}
                />
                {errors?.displayName && <ValidationMessage message={errors.displayName.message} dataTestSelector="requiredDisplayNameError" />}
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblAddressLine1">
                    {account("addressLine1")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  data-test-selector="txtAddressLine1"
                  aria-label="Address Line 1"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("address1", {
                    required: account("requiredAddressLine1"),
                    validate: (value: string) => sanitizeInputValue(value, account("requiredAddressLine1")),
                  })}
                />
                {errors.address1 && <ValidationMessage message={errors.address1.message} dataTestSelector="requiredStateError" />}
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblAddressLine2">
                    {account("addressLine2")}
                  </label>
                </div>
                <input
                  data-test-selector="txtAddressLine2"
                  aria-label="Address Line 2"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("address2")}
                />
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblAddressPhoneNumber">
                    {account("phoneNumber")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  type="text"
                  data-test-selector="txtPhoneNumber"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("phoneNumber", {
                    required: account("requiredPhoneNumber"),
                    validate: (value: number) => sanitizeInputValue(value.toString(), account("requiredPhoneNumber")),
                  })}
                  aria-label="Phone number"
                />
                {errors.phoneNumber && <ValidationMessage message={account("requiredPhoneNumber")} dataTestSelector="requiredPhoneNumberError" />}
              </div>
            </div>
            <div className="col-span-1">
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblCountry">
                    {account("country")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <div className="relative">
                  <select
                    data-test-selector="drpCountry"
                    aria-label="Country"
                    className="w-full h-10 px-2 py-1 border appearance-none rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                    {...register("countryName", {
                      required: account("requiredCountry"),
                      onChange(event: React.ChangeEvent<HTMLSelectElement>) {
                        handleChangeCountry(event);
                      },
                    })}
                  >
                    {renderCountries()}
                  </select>
                  <div className="absolute inset-y-0 flex items-center pointer-events-none right-1">
                    <ZIcons name="chevron-down" data-test-selector="svgCountryArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
                  </div>
                </div>
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblState">
                    {account("state")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <div className="relative">
                  <select
                    data-test-selector="drpState"
                    aria-label="State"
                    className="w-full h-10 px-2 py-1 border appearance-none rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                    {...register("stateName", {
                      required: account("requiredState"),
                    })}
                  >
                    {renderStates()}
                  </select>
                  <div className="absolute inset-y-0 flex items-center pointer-events-none right-1">
                    <ZIcons name="chevron-down" data-test-selector="svgStateArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
                  </div>
                </div>
                {errors.stateName && <ValidationMessage message={errors.stateName.message} dataTestSelector="requiredStateError" />}
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblCity">
                    {account("city")} <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  data-test-selector="txtCity" 
                  aria-label="City"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("cityName", { required: account("requiredCity"), validate: (value: string) => sanitizeInputValue(value, account("requiredCity")) })}
                />
                {errors.cityName && <ValidationMessage message={account("requiredCity")} dataTestSelector="requiredCityError" />}
              </div>
              <div className="pb-2">
                <div className="pb-2 required">
                  <label className="font-semibold" data-test-selector="lblPostalCode">
                    {account("postalCode")}
                    <strong className="ml-1 text-errorColor">*</strong>
                  </label>
                </div>
                <input
                  data-test-selector="txtPostalCode"
                  aria-label="Postal code"
                  className="w-full h-10 px-2 py-1 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black"
                  {...register("postalCode", {
                    required: { value: true, message: account("requiredPostalCode") },
                    validate: (value: string) => sanitizeInputValue(value, account("requiredPostalCode")),
                  })}
                />
                {errors.postalCode && <ValidationMessage message={errors.postalCode.message} dataTestSelector="requiredPostalCodeError" />}
              </div>
            </div>
          </div>
          <div className="flex justify-end pb-2 mt-3 text-right xs:text-xs xs:p-1">
            <Link href="/account/dashboard" data-test-selector="linkCancel" className="px-5 py-2 mr-3 text-sm font-semibold tracking-wider uppercase btn btn-secondary">
              {common("cancel")}
            </Link>
            <Button
              htmlType="submit"
              type="primary"
              size="small"
              loading={updateBtn}
              className="px-5 mr-3"
              dataTestSelector="btnSaveChanges"
              ariaLabel="Save changes"
              showLoadingText={true}
              loaderColor="#fff"
              loaderWidth="20px"
              loaderHeight="20px"
            >
              {account("saveChanges")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
