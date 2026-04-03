"use client";

import { ADDRESS, ROLE } from "@znode/constants/address";
import { IAddAddressRequest, IAddress, IAddressList, IEditAddressRequest } from "@znode/types/address";
import { IUpdateAddressResponse, IUser, IUserAddressModel } from "@znode/types/user";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { AddEditAddress } from "../add-edit/AddEditAddress";
import AddressSelector from "../AddressSelector";
import ConfirmRoleModal from "../ConfirmationPop";
import { Heading } from "../../common/heading";
import { Modal } from "../../common/modal/Modal";
import { useModal } from "../../../stores/modal";
import { useTranslations } from "next-intl";
import { useUser } from "../../../stores/user-store";

interface BillingAddressSectionProps {
  addressList: IAddress[];
  selectedAddress?: IAddress;
  onAddressChange: (_id: string, _type: string) => void;
  onSaveAddress: (_res: IUpdateAddressResponse, _isBilling: boolean) => void;
  hideAddressButtons: boolean;
  userInfo?: IUserAddressModel;
  addressInfo?: IAddressList;
  restrictOtherActions?: Dispatch<SetStateAction<{ isShippingAddressOpen: boolean; isBillingAddressOpen: boolean }>>;
  isDefaultAddAddressView: boolean;
  setDontSaveAddressChecked: Dispatch<SetStateAction<boolean>>;
  isHideAddEditButton: boolean;
  enableAddressValidation: boolean;
}

const BillingAddressSection: React.FC<BillingAddressSectionProps> = ({
  addressList,
  selectedAddress,
  onAddressChange,
  hideAddressButtons,
  userInfo,
  addressInfo,
  onSaveAddress,
  restrictOtherActions,
  isDefaultAddAddressView,
  setDontSaveAddressChecked,
  isHideAddEditButton,
  enableAddressValidation,
}) => {
  const addressTranslations = useTranslations("Address");

  const [showEditAddress, setShowEditAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(isDefaultAddAddressView || false);
  const [addressType, setAddressType] = useState<string>(ADDRESS.ADD_ADDRESS);
  const [formTypes, setFormTypes] = useState<string>();
  const [isDropDownChange, setIsDropDownChange] = useState<string>("");
  const { user } = useUser();
  const { closeModal, openModal } = useModal();

  const handleShowHideBillingAddress = () => {
    setShowEditAddress(false);
    setShowAddAddress(false);
  };

  const filterBillingAddresses = (addresses: IAddress[]): number => {
    return addresses.filter((address: IAddress) => address.isBilling || address.isDefaultBilling || address.isBothBillingShipping).length;
  };

  const userAddressCount = filterBillingAddresses(addressList);

  const saveAddress = (address: IUpdateAddressResponse) => {
    handleShowHideBillingAddress();
    onSaveAddress(address, true);
  };

  const onAddressChanged = (addressId: string) => {
    onAddressChange(addressId, ADDRESS.BILLING_ADDRESS_TYPE);
  };

  const onAddNew = (isSectionShow: boolean) => {
    setShowAddAddress(isSectionShow);
    setAddressType(ADDRESS.ADD_ADDRESS);
    restrictOtherActions && restrictOtherActions({ isShippingAddressOpen: false, isBillingAddressOpen: true });
  };

  const onEdit = (isSectionShow: boolean) => {
    setShowAddAddress(isSectionShow);
    setAddressType(ADDRESS.EDIT_ADDRESS);
    restrictOtherActions && restrictOtherActions({ isShippingAddressOpen: false, isBillingAddressOpen: true });
  };

  const handleBackClick = () => {
    setShowAddAddress(false);
    restrictOtherActions && restrictOtherActions({ isShippingAddressOpen: false, isBillingAddressOpen: false });
  };

  /** Request body after click on Add or Edit button  */
  const createAddEditAddressRequest = (type: string): IEditAddressRequest | IAddAddressRequest => {
    if (type === ADDRESS.EDIT_ADDRESS) {
      return {
        addressId: selectedAddress?.addressId ?? 0,
        otherAddressId: selectedAddress?.otherAddressId ?? 0,
        type: ADDRESS.BILLING_ADDRESS_TYPE,
        isFromEdit: true,
        isGuestUser: userInfo?.userId && userInfo.userId > 0 ? false : true,
      };
    } else {
      return {
        type: ADDRESS.BILLING_ADDRESS_TYPE,
        isGuestUser: userInfo?.userId && userInfo.userId > 0 ? false : true,
        userId: userInfo?.userId,
        accountId: userInfo?.accountId,
        hasDefaultBillingAddress: addressInfo?.billingAddress?.postalCode ? true : false,
      };
    }
  };

  useEffect(() => {
    setShowAddAddress(isDefaultAddAddressView);
  }, [isDefaultAddAddressView]);

  const handledConfirmationModalClosed = () => {
    closeModal();
    return;
  };
  const handledConfirmationModal = (type: string) => {
    if (isDropDownChange !== "") {
      onAddressChanged(isDropDownChange);
    } else if (type === "add") {
      onAddNew && onAddNew(true);
    } else {
      onEdit && onEdit(true);
    }
    closeModal();
  };

  const isUserRole = (user?.roleName === ROLE.USER_B2B || user?.roleName === ROLE.MANAGER_B2B) && user.crsName && user.crsName?.length > 0;
  const handledAddClick = (isSectionShow: boolean) => {
    if (isUserRole) {
      setFormTypes("add");
      openModal("RoleBaseBillingConfirmation");
    } else {
      onAddNew(isSectionShow);
    }
  };

  const handledEditClick = (isSectionShow: boolean) => {
    if (isUserRole) {
      setFormTypes("edit");
      openModal("RoleBaseBillingConfirmation");
    } else {
      onEdit(isSectionShow);
    }
  };

  const handledChangeDropDown = (res: string) => {
    if (user?.roleName === ROLE.USER_B2B && user.crsName && user.crsName?.length > 0) {
      setIsDropDownChange(res);
      openModal("RoleBaseBillingConfirmation");
    } else {
      onAddressChanged(res);
      setIsDropDownChange("");
    }
  };

  return (
    <div className="w-full">
      <Heading name={addressTranslations("billingAddress")} dataTestSelector="hdgBillingAddress" customClass="uppercase" level="h2" showSeparator />

      {!showAddAddress && !showEditAddress && (
        <AddressSelector
          addressList={addressList}
          selectedAddress={selectedAddress}
          onAddressChange={handledChangeDropDown}
          hideAddressButtons={hideAddressButtons}
          dataTestSelectorName="Billing"
          onAddNewAddress={handledAddClick}
          onEditAddress={handledEditClick}
          enableShippingAddressSuggestion={false}
          addressType="Billing"
          isHideAddEditButton={isHideAddEditButton}
        />
      )}

      {showAddAddress && (
        <AddEditAddress
          addAddressData={createAddEditAddressRequest(ADDRESS.ADD_ADDRESS)}
          backClick={handleBackClick}
          saveClick={(res) => saveAddress(res)}
          userAddressCount={userAddressCount}
          backClickForGuest={handleBackClick}
          editAddressData={createAddEditAddressRequest(ADDRESS.EDIT_ADDRESS) as IEditAddressRequest}
          addressType={addressType}
          setDontSaveAddressChecked={setDontSaveAddressChecked}
          selectedAddress={selectedAddress}
          userDetails={userInfo as IUser}
          enableAddressValidation={enableAddressValidation}
        />
      )}

      <Modal size="2xl" modalId="RoleBaseBillingConfirmation" maxHeight="lg" customClass="overflow-y-auto no-print">
        <ConfirmRoleModal isOpen={true} onClose={() => handledConfirmationModalClosed()} onConfirm={() => handledConfirmationModal(formTypes as string)} />
      </Modal>
    </div>
  );
};

export default BillingAddressSection;
