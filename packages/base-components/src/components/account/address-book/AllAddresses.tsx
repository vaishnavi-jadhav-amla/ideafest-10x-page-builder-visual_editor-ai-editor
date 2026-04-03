"use client";

import { IAddress, IAllAddressList } from "@znode/types/address";
import { deleteAddress, updateAddressBookBillingShippingFlag } from "../../../http-request/account/address-book/address";
import { useEffect, useState } from "react";

import { ADDRESS } from "@znode/constants/address";
import Button from "../../common/button/Button";
import DisplayAddress from "../../address/display/DisplayAddress";
import Heading from "../../common/heading/Heading";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import { Separator } from "../../common/separator/Separator";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { useToast } from "../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

const AllAddresses = (props: IAllAddressList) => {
  const addressTranslation = useTranslationMessages("Address");
  const commonTranslation = useTranslationMessages("Common");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [addressList, setAddressList] = useState<IAddress[]>(props.addressList);
  const { fetchUpdatedAddressData, disableAddressButton } = props;
  const { error, success } = useToast();

  useEffect(() => {
    setAddressList(props.addressList);
  }, [props.addressList]);

  const deleteAddressById = async (addressId: number) => {
    if (addressId) {
      setSelectedAddressId(addressId);
      setIsLoading(true);
      const message = await deleteAddress({ addressId });
      if (message === ADDRESS.SUCCESS_DELETE_ADDRESS) {
        success(addressTranslation(message));
        setAddressList((prev) => prev.filter((addr) => addr.addressId !== addressId));
        fetchUpdatedAddressData();
      } else {
        error(addressTranslation(message));
      }

      setIsLoading(false);
      setSelectedAddressId(0);
    }
  };

  const updateAddressBillingShippingFlag = async (addressId: number | undefined, isDefaultBillingAddress: boolean) => {
    if (addressId) {
      const addressModel = await updateAddressBookBillingShippingFlag(addressId, isDefaultBillingAddress);

      if (addressModel) {
        if (!addressModel.hasError && addressModel.isDefaultBilling) {
          success(addressTranslation("changedPrimaryBilling"));
          fetchUpdatedAddressData();
        } else if (!addressModel.hasError && addressModel.isDefaultShipping) {
          success(addressTranslation("changedPrimaryShipping"));
          fetchUpdatedAddressData();
        } else error(addressTranslation("errorChangedAddress"));
      }
    }
  };

  const renderAddressList = (addressData: IAddress[]) => {
    return (
      addressData.length > 0 &&
      addressData.map((address: IAddress) => {
        const { addressId, displayName, isDefaultShipping, isDefaultBilling } = address;
        const isDeleting = isLoading && selectedAddressId === addressId;
        return (
          <div className="flex flex-col justify-between col-span-1 mb-5 md:pl-3 md:mb-0 border border-cardBorderColor rounded-cardBorderRadius shadow-md p-3" key={addressId}>
            <div className="flex justify-between pb-3 gap-1 w-full ">
              <div className="w-4/5 flex-grow">
                <p className="pb-2 font-semibold break-words " data-test-selector={`paraAddressName${addressId}`}>
                  {displayName}
                </p>
                <DisplayAddress userAddress={address} addressType="AllAddress" />
              </div>
              {!disableAddressButton && (
                <div className="flex items-start">
                  {!isDeleting && (
                    <Link
                      href={`/account/address-book/add-edit-address?addressId=${addressId}`}
                      aria-label={`Address Edit Icon-${addressId}`}
                      className="pr-2"
                      data-test-selector={`linkEditAddress${addressId}`}
                      prefetch={false}
                    >
                      <Tooltip message={commonTranslation("edit")}>
                        <ZIcons name="pencil" data-test-selector={`svgEditAddress${addressId}`} />
                      </Tooltip>
                    </Link>
                  )}
                  {!(isDefaultShipping || isDefaultBilling) && (
                    <Button
                      type="text"
                      size="small"
                      dataTestSelector={`btnDeleteAddress${addressId}`}
                      value={`${addressId}`}
                      disabled={isLoading}
                      onClick={() => {
                        if (!isLoading) {
                          deleteAddressById(addressId ?? 0);
                        }
                      }}
                      startIcon={
                        isDeleting ? (
                          <LoaderComponent isLoading={true} width="20px" height="20px" color="#707070" />
                        ) : (
                          <Tooltip message={commonTranslation("remove")}>
                            <ZIcons name="trash-2" data-test-selector={`svgRemoveAddress${addressId}`} />
                          </Tooltip>
                        )
                      }
                      ariaLabel="Address delete icon"
                    />
                  )}
                </div>
              )}
            </div>

            {!disableAddressButton && (
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-end md:justify-start lg:justify-end">
                {isDefaultShipping ? (
                  <Button
                    type="link"
                    size="small"
                    className="w-full sm:w-auto no-underline pointer-events-none xs:pr-3 md:pl-0"
                    dataTestSelector={`btnPrimaryShipping${addressId}`}
                    ariaLabel="Primary shipping address button"
                  >
                    {addressTranslation("textPrimaryShippingAddress")}
                  </Button>
                ) : (
                  <Button
                    type="link"
                    size="small"
                    className="w-full sm:w-auto underline xs:pr-3 md:pl-0"
                    dataTestSelector={`btnSetPrimaryShippingAddress${addressId}`}
                    onClick={() => updateAddressBillingShippingFlag(addressId, false)}
                    ariaLabel="Set as primary shipping"
                  >
                    {addressTranslation("linkTextPrimaryShipping")}
                  </Button>
                )}
                <div className="hidden h-8 border-r-2 lg:block border-linkColor"></div>
                {isDefaultBilling ? (
                  <Button
                    type="link"
                    size="small"
                    className="w-full sm:w-auto no-underline pointer-events-none xs:pl-3 md:pl-0 lg:pl-3"
                    dataTestSelector={`btnPrimaryBilling${addressId}`}
                    ariaLabel="Primary billing address"
                  >
                    {addressTranslation("textPrimaryBillingAddress")}
                  </Button>
                ) : (
                  <Button
                    type="link"
                    size="small"
                    className="w-full sm:w-auto underline xs:pl-3 md:pl-0 lg:pl-3"
                    onClick={() => updateAddressBillingShippingFlag(addressId, true)}
                    dataTestSelector={`btnSetPrimaryBillingAddress${addressId}`}
                    ariaLabel="Set as Primary Billing"
                  >
                    {addressTranslation("linkTextPrimaryBilling")}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })
    );
  };

  return (
    <div className="mb-10" data-test-selector="divAllAddressContainer">
      <div className="flex items-center justify-between">
        <Heading name={addressTranslation("allAddress")} customClass="uppercase" level="h3" dataTestSelector="hdgAllAddress" />
        {!disableAddressButton && (
          <Link
            href="/account/address-book/add-edit-address"
            className="w-full text-sm text-right underline text-linkColor hover:text-hoverColor"
            data-test-selector="linkAddAddress"
            prefetch={false}
          >
            {addressTranslation("addAddress")}
          </Link>
        )}
      </div>
      <Separator customClass="mt-0" />
      <div className="grid-cols-2 gap-8 md:grid">{addressList ? renderAddressList(addressList) : null}</div>
    </div>
  );
};
export default AllAddresses;
