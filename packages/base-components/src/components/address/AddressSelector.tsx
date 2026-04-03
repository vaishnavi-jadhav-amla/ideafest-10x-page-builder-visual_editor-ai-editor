/* eslint-disable react/jsx-no-useless-fragment */
"use client";

import React, { useEffect, useState } from "react";

import AddressSelect from "./AddressSelect";
import Button from "../common/button/Button";
import DisplayAddress from "./display/DisplayAddress";
import { IAddress } from "@znode/types/address";
import LoaderComponent from "../common/loader-component/LoaderComponent";
import { ROLE } from "@znode/constants/address";
import ShippingAddressSuggestion from "./shipping/ShippingAddressSuggestion";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../stores/user-store";

/**
 * Props interface for the AddressSelector component.
 */
interface IAddressSelectorProps {
  addressList: IAddress[];
  selectedAddress?: IAddress | null;
  onAddressChange: (_addressId: string) => void;
  onAddNewAddress?: (_isSectionShow: boolean) => void;
  onEditAddress?: (_isSectionShow: boolean) => void;
  hideAddressButtons?: boolean;
  dataTestSelectorName?: string;
  enableShippingAddressSuggestion: boolean;
  addressType: string;
  isHideAddEditButton: boolean;
}

/**
 * AddressSelector Component
 * A reusable component for selecting and displaying addresses.
 */
const AddressSelector: React.FC<IAddressSelectorProps> = ({
  addressList,
  selectedAddress,
  onAddressChange,
  onAddNewAddress,
  onEditAddress,
  hideAddressButtons = false,
  dataTestSelectorName,
  enableShippingAddressSuggestion,
  addressType,
  isHideAddEditButton,
}) => {
  const checkoutTranslations = useTranslationMessages("Checkout");
  const [searchAddress, setSearchAddress] = useState<IAddress>();
  const { user } = useUser();

  useEffect(() => {
    if (searchAddress && selectedAddress) {
      setSearchAddress(selectedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress]);

  /**
   * Renders the add new address button if the onAddNewAddress function is provided.
   * @param onAddNewAddress - The function to handle adding a new address.
   * @returns The add new address button JSX element or null if no function is provided.
   */
  // eslint-disable-next-line no-unused-vars
  const renderAddNewAddressButton = (onAddNewAddress?: (isClicked: boolean) => void) => {
    if (!onAddNewAddress) return null;
    return (
      <>
        <Button
          type="link"
          size="small"
          dataTestSelector="btnAddAddress"
          onClick={() => onAddNewAddress(true)}
          className="pr-2 font-medium no-underline uppercase"
          data-test-selector={`spnAddNew${dataTestSelectorName}Address`}
        >
          {checkoutTranslations("addNew")}
        </Button>
        {!enableShippingAddressSuggestion && <div className="h-8 border-r-2 border-linkColor"></div>}
      </>
    );
  };

  /**
   * Renders the edit address button if the onEditAddress function is provided.
   * @param onEditAddress - The function to handle editing an existing address.
   * @returns The edit address button JSX element or null if no function is provided.
   */
  // eslint-disable-next-line no-unused-vars
  const renderEditAddressButton = (onEditAddress?: (isClicked: boolean) => void) => {
    if (!onEditAddress) return null;
    return (
      <Button
        type="link"
        size="small"
        dataTestSelector="btnEditAddress"
        onClick={() => onEditAddress(true)}
        className="pl-2 font-medium no-underline uppercase"
        data-test-selector={`spnEdit${dataTestSelectorName}Address`}
      >
        {checkoutTranslations("edit")}
      </Button>
    );
  };

  const getSearchedAddress = (addressId: number) => {
    const sortedAddress = addressList?.find((item) => item.addressId === addressId);
    setSearchAddress(sortedAddress);
    onAddressChange(`${addressId}`);
  };
  const canShowButtons = !!user?.crsName && ROLE.LIST.includes(user?.roleName ?? "");
  const shouldShowButtons = canShowButtons || (!hideAddressButtons && !isHideAddEditButton);
  return (
    <div className="flex flex-col justify-between w-full gap-4 sm:flex-row md:gap-6">
      {searchAddress || selectedAddress ? (
        <>
          <div className="md:w-9/12">
            <AddressSelect
              addressList={addressList}
              onAddressChange={onAddressChange}
              selectedAddressId={searchAddress?.addressId ?? selectedAddress?.addressId ?? 0}
              isDisabled={hideAddressButtons && user?.crsName === ""}
            />
            {enableShippingAddressSuggestion && selectedAddress && (
              <ShippingAddressSuggestion addressList={addressList} onAddressChange={(addressId) => getSearchedAddress(addressId)} userAddress={searchAddress || selectedAddress} />
            )}
            {selectedAddress && <DisplayAddress userAddress={searchAddress || selectedAddress} addressType={addressType} />}
          </div>
          <div className="ml-auto">
            {shouldShowButtons && (
              <div className="flex items-center ml-auto">
                {renderAddNewAddressButton(onAddNewAddress)}
                {!enableShippingAddressSuggestion && renderEditAddressButton(onEditAddress)}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full">
          <LoaderComponent isLoading={true} width="50px" height="50px" />
        </div>
      )}
    </div>
  );
};

export default React.memo(AddressSelector);
