"use client";

import { IAddress, IAddressList } from "@znode/types/address";
import React, { useEffect, useState } from "react";

import AllAddresses from "./AllAddresses";
import { Heading } from "../../common/heading";
import Link from "next/link";
import { LoadingSpinnerComponent } from "../../common/icons";
import { PrimaryBillingShippingAddress } from "./PrimaryBillingShippingAddress";
import { getAddressList } from "../../../http-request/account/address-book/address";
import { useTranslationMessages } from "@znode/utils/component";

export const AddressBook = () => {
  const addressTranslation = useTranslationMessages("Address");
  const accountTranslation = useTranslationMessages("MyAccount");

  const [addressList, setAddressList] = useState<IAddress[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [address, setAddress] = useState<IAddressList>();
  // If the user is associated with an Account and does not have a Manager or Administrator role, hide the Address Dropdown and Add/Edit Address buttons.
  const [hideAddressButtons, setHideAddressButtons] = useState<boolean>(false);

  const fetchAddressData = async () => {
    setIsLoading(true);
    try {
      const address = await getAddressList(0, true);
      setAddressList(address.addressList);
      setHideAddressButtons(address?.hideAddressButton ?? false);
      setAddress(address);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddressData();
  }, []);

  return (
    <div>
      <Heading name={accountTranslation("addressBook")} customClass="uppercase" level="h1" showSeparator dataTestSelector="hdgAddressBook" />
      {address && <PrimaryBillingShippingAddress addressData={address} disableAddressButton={hideAddressButtons} />}
      {!isLoading
        ? !(addressList && addressList.length > 0) &&
          !hideAddressButtons && (
            <div className="text-right">
              <Link href="/account/address-book/add-edit-address" className="font-medium text-linkColor hover:text-blue-500" data-test-selector="linkAddAddress" prefetch={false}>
                {addressTranslation("addAddress")}
              </Link>
            </div>
          )
        : null}

      {addressList ? (
        addressList.length > 0 ? (
          <AllAddresses addressList={addressList} fetchUpdatedAddressData={fetchAddressData} disableAddressButton={hideAddressButtons} />
        ) : null
      ) : isLoading ? (
        <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
      ) : null}
    </div>
  );
};
