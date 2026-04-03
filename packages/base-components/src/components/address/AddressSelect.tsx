"use client";

import React, { ChangeEvent } from "react";

import { IAddress } from "@znode/types/address";
import { SETTINGS } from "@znode/constants/settings";
import { ZIcons } from "../common/icons";

/**
 * Props interface defining the props expected by the AddressSelect component.
 */
interface Props {
  addressList: IAddress[];
  selectedAddressId: number | null;
  onAddressChange: (_addressId: string) => void;
  isDisabled?: boolean;
}

/**
 * AddressSelect Component
 * A reusable component for selecting an address from a dropdown list.
 * @param {Props} props - The props for the AddressSelect component.
 */
const AddressSelect: React.FC<Props> = ({ addressList, selectedAddressId, onAddressChange, isDisabled = false }) => {
  /**
   * Handles the change event when selecting an address from the dropdown.
   * @param {ChangeEvent<HTMLSelectElement>} e - The change event object.
   */
  const handleChangeAddress = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    onAddressChange(selectedId);
  };

  // Render the component only if there are addresses in the addressList
  if (addressList.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full md:w-1/2 pb-2" data-test-selector="divSelectedShippingAddress">
      <select
        disabled={isDisabled}
        className="appearance-none w-full h-10 p-1 input pr-6"
        onChange={handleChangeAddress}
        data-test-selector="drpSelectedShippingAddress"
        aria-label="Select Shipping Address"
        value={selectedAddressId !== null ? selectedAddressId.toString() : ""}
      >
        {addressList.map((address) => (
          <option key={address.addressId} value={address.addressId?.toString()}>
            {address.displayName}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-1 bottom-2 flex items-center pointer-events-none">
        <ZIcons name="chevron-down" data-test-selector="svgAddressArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
      </div>
    </div>
  );
};

export default React.memo(AddressSelect);
