"use client";

import { IAddress, IAddressList } from "@znode/types/address";

import { ADDRESS } from "@znode/constants/address";
import Button from "../../common/button/Button";
import { Heading } from "../../common/heading";
import { SPACE_REMOVAL_REGEX } from "@znode/constants/regex";
import { useTranslationMessages } from "@znode/utils/component";

interface IRecommendedAddressProps {
  enteredAddress: IAddress;
  recommendedAddress: IAddressList | undefined;
  update: (_arg1: IAddress) => void;
}

const RecommendedAddress = ({ enteredAddress, recommendedAddress, update }: IRecommendedAddressProps) => {
  const addressTranslation = useTranslationMessages("Address");
  const formatWithProperSpacing = (text: string | undefined): string => {
    return text ? text.replace(SPACE_REMOVAL_REGEX.SPACING_AFTER_COMMAS_REGEX, ", ").trim() : "";
  };
  const recommendedAddressDetails = (address: IAddress) => {
    const addressDetails = enteredAddress;
    if (addressDetails) {
      addressDetails.address1 = address.address1;
      addressDetails.address2 = address.address2;
      addressDetails.cityName = address.cityName;
      addressDetails.stateName = address.stateName;
      addressDetails.postalCode = address.postalCode;
      addressDetails.countryName = address.countryName;
    }
    update(addressDetails as IAddress);
  };

  const renderRecommendedAddresses = (recommendedAddress: IAddressList | undefined) => {
    return (
      recommendedAddress &&
      recommendedAddress.addressList?.map((address: IAddress, index: number) => {
        const uniqueKey = index;
        return (
          <div className="mb-3" key={`address-${uniqueKey}`}>
            <div className="mb-2" data-test-selector="divRecommendedAddress">
              <p data-test-selector="paraRecommendedAddress1">{formatWithProperSpacing(address?.address1)}</p>
              <p data-test-selector="paraRecommendedAddress2">{formatWithProperSpacing(address?.address2)}</p>
              <p>
                <span data-test-selector="spnRecommendedCityName"> {formatWithProperSpacing(address?.cityName)}</span>,{" "}
                <span data-test-selector="spnRecommendedStateName">{formatWithProperSpacing(address?.stateName)}</span>,{" "}
                <span data-test-selector="spnRecommendedPostalCode">{formatWithProperSpacing(address?.postalCode)}</span>,{" "}
                <span data-test-selector="spnRecommendedCountryName">{formatWithProperSpacing(address?.countryName)}</span>
              </p>
            </div>
            <div className="text-right">
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  recommendedAddressDetails(address);
                }}
                dataTestSelector="btnRecommendedAddressUpdate"
                ariaLabel="update address button"
              >
                {addressTranslation("update")}
              </Button>
            </div>
          </div>
        );
      })
    );
  };

  return (
    <div className="p-2">
      <Heading name={addressTranslation("pleaseConfirmYourAddress")} customClass="uppercase" level="h2" dataTestSelector="hdgConfirmYourAddress" />
      <div>
        <div className="mb-3">
          <Heading name={addressTranslation("enteredAddress")} dataTestSelector="hdgEnteredAddress" level="h3" showSeparator />

          <div className="mb-2">
            <p data-test-selector="paraConfirmYourAddress1">{formatWithProperSpacing(enteredAddress?.address1)}</p>
            <p data-test-selector="paraConfirmYourAddress2"> {formatWithProperSpacing(enteredAddress?.address2)}</p>
            <p>
              <span data-test-selector="spnEnteredCityName">{formatWithProperSpacing(enteredAddress?.cityName)}</span>,{" "}
              <span data-test-selector="spnEnteredStateName">{formatWithProperSpacing(enteredAddress?.stateName)}</span>,{" "}
              <span data-test-selector="spnEnteredPostalCode">{formatWithProperSpacing(enteredAddress?.postalCode)}</span>,{" "}
              <span data-test-selector="spnEnteredCountryName">{formatWithProperSpacing(enteredAddress?.countryName)}</span>
            </p>
          </div>
          <div className="text-right">
            <Button
              type="primary"
              size="small"
              dataTestSelector="btnUpdate"
              value={ADDRESS.ENTER_ADDRESS}
              onClick={() => {
                update(enteredAddress);
              }}
            >
              {addressTranslation("update")}
            </Button>
          </div>
        </div>
        <div>
          <Heading name={addressTranslation("recommendedAddress")} dataTestSelector="hdgRecommendedAddress" level="h3" showSeparator />
          {renderRecommendedAddresses(recommendedAddress)}
        </div>
      </div>
    </div>
  );
};
export default RecommendedAddress;
