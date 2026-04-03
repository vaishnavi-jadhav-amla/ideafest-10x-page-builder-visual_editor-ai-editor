import { IAddress } from "@znode/types/address";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

interface IDisplayAddress {
  userAddress?: IAddress;
  addressType?: string;
}

const DisplayAddress = ({ userAddress, addressType }: IDisplayAddress) => {
  const accountTranslations = useTranslationMessages("MyAccount");
  const addressParts = userAddress ? [userAddress.cityName, userAddress.stateName, userAddress.countryName + " " + userAddress.postalCode] : [];
  const formattedAddress = addressParts.filter(Boolean).join(", ");
  return (
    <div>
      {userAddress && (
        <>
          <div data-test-selector={`div${addressType}Address${userAddress.addressId}`}>
            <p className="font-semibold break-all">
              <span data-test-selector={`spn${addressType}FirstName${userAddress.addressId}`}>{userAddress.firstName}</span>{" "}
              <span data-test-selector={`spn${addressType}LastName${userAddress.addressId}`}>{userAddress.lastName}</span>
            </p>
          </div>
          <p className="break-all" data-test-selector={`para${addressType}CompanyName${userAddress.addressId}`}>
            {userAddress.companyName}{" "}
          </p>
          <p className="break-all" data-test-selector={`para${addressType}Address1_${userAddress.addressId}`}>
            {userAddress.address1}
          </p>
          <p className="break-all" data-test-selector={`para${addressType}Address2_${userAddress.addressId}`}>
            {" "}
            {userAddress.address2}
          </p>
          <p className="break-all" data-test-selector={`para${addressType}Address${userAddress.addressId}`}>
            {formattedAddress}
          </p>
          {userAddress.phoneNumber && (
            <p className="break-all" data-test-selector={`para${addressType}PhoneNumber${userAddress.addressId}`}>
              {accountTranslations("ph")}: {userAddress.phoneNumber}{" "}
            </p>
          )}
          {userAddress.addressId == 0 && addressType != "Billing" && (
            <p data-test-selector={`para${addressType}Email${userAddress.addressId}`}>
              {accountTranslations("email")}: {userAddress.emailAddress ?? "NA"}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DisplayAddress;
