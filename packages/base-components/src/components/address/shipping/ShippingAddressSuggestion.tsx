"use client";

import { IAddress } from "@znode/types/address";
import { filterObjectsByProperties, useTranslationMessages } from "@znode/utils/component";
import { useEffect, useRef, useState } from "react";
import Input from "../../common/input/Input";

interface IShippingAddressSuggestion {
  addressList: IAddress[];
  onAddressChange: (_addressId: number) => void;
  userAddress: IAddress;
}

const ShippingAddressSuggestion = ({ addressList, onAddressChange, userAddress }: IShippingAddressSuggestion) => {
  const checkoutTranslations = useTranslationMessages("Checkout");
  const [filteredAddressData, setFilteredAddressData] = useState<IAddress[]>();
  const addressListRef = useRef<HTMLUListElement>(null);

  function handleClickOutside(event: MouseEvent) {
    if (addressListRef.current && !addressListRef.current.contains(event.target as Node)) {
      setFilteredAddressData([]);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getAddressSuggestions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value || "";
    const searchTermLength = searchTerm.length || 0;

    if (searchTermLength >= 3) {
      const searchProperties: (keyof IAddress)[] = ["firstName", "lastName", "companyName", "address1", "countryName", "stateName", "cityName", "postalCode", "phoneNumber"];
      const suggestionsData = filterObjectsByProperties(addressList, searchTerm, searchProperties);

      if (!(suggestionsData.length > 0)) {
        const address: { address1: string } = { address1: checkoutTranslations("noAddressMatchedYourSearch") };
        suggestionsData.push(address as IAddress);
      }
      setFilteredAddressData(suggestionsData);
    } else {
      setFilteredAddressData([]);
    }
  };

  const renderAddressList = (addressData: IAddress[]) => {
    return (
      addressData &&
      addressData.map((address: IAddress, i: number) => {
        const { displayName, address1, address2, cityName, stateCode, postalCode, addressId } = address;
        if (addressId) {
          return (
            <li
              className="p-2 border-b cursor-pointer"
              key={addressId}
              onClick={() => {
                onAddressChange(addressId);
                setFilteredAddressData([]);
              }}
            >
              <p data-test-selector={`paraDisplayName${addressId}`}>{displayName}</p>
              <p>
                <span data-test-selector={`spnAddress2-${addressId}`}>{address2}</span>
                <span data-test-selector={`spnAddress1-${addressId}`}>{address1}</span>
              </p>
              <p>
                <span data-test-selector={`spnCityName${addressId}`}>{cityName}, </span>
                <span data-test-selector={`spnStateCode${addressId}`}>{stateCode} </span>
                <span data-test-selector={`spnPostalCode${addressId}`}>{postalCode}</span>
              </p>
            </li>
          );
        } else {
          return (
            <li data-test-selector="listNoAddressMatched" className="p-2" key={i}>
              {address1}
            </li>
          );
        }
      })
    );
  };

  return (
    <>
      <div className="pb-2">
        <div className="relative w-1/2">
          <Input
            dataTestSelector="txtShippingSuggestion"
            ariaLabel="First Name"
            className="w-full py-1"
            id="shipping-suggestion"
            placeholder={checkoutTranslations("searchLocationName")}
            onChange={getAddressSuggestions}
            isLabelShow={true}
            label={checkoutTranslations("searchForShippingAddress")}
            labelCustomClass="font-semibold"
            labelDataTestSelector="lblShippingSuggestion"
          />
          {filteredAddressData && filteredAddressData?.length > 0 && (
            <ul
              ref={addressListRef}
              className="absolute left-0 w-full overflow-y-auto bg-white border border-t-0 border-gray-300 shadow-md max-h-screen-80 rounded-cardBorderRadius z-10"
            >
              {renderAddressList(filteredAddressData)}
            </ul>
          )}
        </div>
      </div>
      <div className="pb-2">
        <Input
          dataTestSelector="txtRecipientName"
          ariaLabel="Recipient Name"
          className="w-1/2 py-1"
          id="recipient-name"
          placeholder=""
          isLabelShow={true}
          isRequired={true}
          disabled={true}
          label={checkoutTranslations("recipientName")}
          labelCustomClass="font-semibold"
          labelDataTestSelector="lblRecipientName"
          value={`${userAddress?.firstName} ${userAddress?.lastName}`}
        />
      </div>
    </>
  );
};

export default ShippingAddressSuggestion;
