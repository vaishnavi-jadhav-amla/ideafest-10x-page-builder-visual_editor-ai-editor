/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IAddress, IAddressList } from "@znode/types/address";
import { IUpdateAddressResponse, IUser } from "@znode/types/user";
import { getAddressDetailsById, getUserAddressDetails, updateAddressIds, updateBillingAddressId } from "../../http-request/address";
import { getGuestUserDetails, getLocalStorageData, setLocalStorageData } from "@znode/utils/component";

import { ADDRESS } from "@znode/constants/address";
import BillingAddressSection from "./billing/BillingAddressSection";
import { IShippingRequest } from "@znode/types/shipping";
import { IShoppingCart } from "@znode/types/shopping";
import ShippingAddressSection from "./shipping/ShippingAddressSection";
import { getCart } from "@znode/agents/cart/cart-helper";
import { getCartNumber } from "../../http-request/cart/get-cart-number";
import { safeJsonParse } from "@znode/utils/common";
import { useCheckout } from "../../stores/checkout";

interface ICreateShipping {
  postalCode: string | undefined;
  countryName: string | undefined;
  stateName: string | undefined;
}

interface ICheckoutAddress {
  addressData: IAddressList;
  resetForm?: boolean;
  resetAddress?: boolean;
  updateShippingOptions?: (_arg: IShippingRequest) => void;
  setIsDisabled: Dispatch<SetStateAction<boolean>>;
  setAddEditAddressOpen?: Dispatch<SetStateAction<{ isShippingAddressOpen: boolean; isBillingAddressOpen: boolean }>>;
  enableShippingAddressSuggestion: boolean;
  isBillingAddressOptional?: boolean;
  userDetails: IUser;
  enableAddressValidation: boolean;
}

export const setOneTimeAddressId = (addressId: number) => {
  const temporaryAddressIds = getLocalStorageData(ADDRESS.ONETIME_ADDRESS_IDS);
  const oneTimeAddressIds = (temporaryAddressIds && JSON.parse(temporaryAddressIds)) || [];

  // Check if the addressId is already in the array
  if (!oneTimeAddressIds.includes(addressId)) {
    oneTimeAddressIds.push(addressId);
    setLocalStorageData(ADDRESS.ONETIME_ADDRESS_IDS, JSON.stringify(oneTimeAddressIds));
  }
};

export const getOneTimeAddressId = () => {
  return safeJsonParse(getLocalStorageData(ADDRESS.ONETIME_ADDRESS_IDS)) || [];
};

export const filterUniqueAddresses = (addressList: IAddress[]) => {
  const uniqueAddressIds = new Set();
  return addressList.filter((address) => {
    if (address.addressId !== undefined && !uniqueAddressIds.has(address.addressId)) {
      uniqueAddressIds.add(address.addressId);
      return true;
    }
    return false;
  });
};

export const concatAddresses = (existingAddresses: IAddress[], oneTimeAddresses: IAddress[]) => {
  return [...existingAddresses, ...oneTimeAddresses];
};

export const createShippingRequest = (addressData: ICreateShipping, shippingAddressId: number, billingAddressId: number): IShippingRequest | any => {
  return {
    shippingPostalCode: addressData.postalCode,
    shippingCountryCode: addressData.countryName,
    shippingStateCode: addressData.stateName,
    shippingAddressId: shippingAddressId,
    billingAddressId: billingAddressId,
  };
};

const fetchAddressDetailsById = async (addressId: number) => {
  return await getAddressDetailsById(addressId);
};

const fetchOneTimeAddresses = async (oneTimeAddressIds: number[]): Promise<IAddress[]> => {
  const promises = oneTimeAddressIds.map((id) => fetchAddressDetailsById(id));
  const responses = await Promise.all(promises);
  return responses.filter((response): response is IAddress => Boolean(response));
};

const getAddressDropDownData = (addressList: IAddress[], addressType: "shipping" | "billing") => {
  return addressList.filter((addressItem) => {
    if (addressType === "shipping") {
      return (addressItem.accountId && addressItem.accountId > 0 && !addressItem.isBilling) || addressItem.isShipping || addressItem.isDefaultShipping;
    } else if (addressType === "billing") {
      return (addressItem.accountId && addressItem.accountId > 0 && !addressItem.isShipping) || addressItem.isBilling || addressItem.isDefaultBilling;
    }
    return false;
  });
};

export const getUserAddress = async (
  userId: number,
  isCartAddress: boolean,
  type: string,
  addressId: number,
  otherAddressId: number,
  isFromEdit: boolean,
  cartModel?: IShoppingCart | null
) => {
  const requestBody = { userId: userId, isCartAddress: isCartAddress, type: type || "", addressId: addressId, otherAddressId: otherAddressId, IsFromEdit: isFromEdit };
  const address = await getUserAddressDetails(requestBody, cartModel as IShoppingCart);
  return address;
};

/** Main Address Edit Component  */
export const AddressWrapper = ({
  addressData,
  updateShippingOptions,
  setIsDisabled,
  resetAddress,
  resetForm,
  setAddEditAddressOpen,
  enableShippingAddressSuggestion,
  isBillingAddressOptional,
  userDetails,
  enableAddressValidation,
}: ICheckoutAddress) => {
  const { setShippingAddressId, setBillingAddressId, shippingAddressId, billingAddressId } = useCheckout();
  const [hideAddressButtons, setHideAddressButtons] = useState<boolean>(false);
  const [addressInfo, setAddressInfo] = useState<IAddressList>();
  const [hideBillingSection, setHideBillingSection] = useState<boolean>(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<IAddress | undefined>();
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<IAddress | undefined>();
  const [isDefaultAddressView, setIsDefaultAddressView] = useState({ isShippingAddress: false, isBillingAddress: false });
  const [isDontSaveAddressChecked, setIsDontSaveAddressChecked] = useState<boolean>(false);
  const [isHideAddEditButton, setIsHideAddEditButton] = useState<boolean>(false);
  const updateShippingMethodFlag = useRef(true);

  /**
    Note:
    - The state hideBillingSection controls the visibility of the billing section.
    - When the state isDefaultAddAddressView is false, the AddressSelector Component is displayed.
    - When the state isDefaultAddAddressView is true, the AddEdit Component Form is displayed.
  */

  const shippingAddresses = getAddressDropDownData(addressInfo?.addressList ?? [], "shipping");
  const billingAddresses = getAddressDropDownData(addressInfo?.addressList ?? [], "billing");

  /** Common function to check guest or new or existing user */
  const isGuestUser = () => {
    return addressData.isGuestUser;
  };

  const isBillingAddress = (address: IAddress) => {
    const result = !!address?.billingAddress?.postalCode;
    return result;
  };

  const isShippingAddress = (address: IAddress) => {
    const result = !!address?.shippingAddress?.postalCode;
    return result;
  };

  /**
   * Handles the flow for guest users by fetching user session data, cart data, and user address data.
   * If the user is a guest user, sets the address hooks with the user address data.
   * Determines the view based on the user address data:
   *   - If the user address is only a shipping address (not a billing address), hides the address buttons and sets the default address view.
   *   - If the user address is a billing address or a shipping address, hides the billing section and sets the default address view.
   *   - If the user address is neither a shipping nor a billing address, sets the default address view.
   */
  const handleGuestUserFlow = async () => {
    const cardNumber = await getCartNumber();
    const cartModel = await getCart(cardNumber ?? "");

    const userAddress = { ...cartModel, isGuestUser: true };
    if (userAddress.isGuestUser) {
      setAddressHooks(userAddress as IAddressList);
    }

    if (isShippingAddress(userAddress) && !isBillingAddress(userAddress)) {
      setHideAddressButtons(true);
      setIsDefaultAddressView({ isShippingAddress: true, isBillingAddress: true });
    } else if (isBillingAddress(userAddress) || isShippingAddress(userAddress)) {
      setHideBillingSection(true);
      setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: false });
    } else if (!isShippingAddress(userAddress) && !isBillingAddress(userAddress)) {
      setIsDefaultAddressView({ isShippingAddress: true, isBillingAddress: true });
    }
  };

  useEffect(() => {
    if (isGuestUser()) {
      handleGuestUserFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles the flow for new users by setting address details, fetching user session data, and setting user data.
   * Determines whether to hide address buttons based on the user's role.
   * Determines the view based on the address data:
   *   - If the address data is neither a billing nor a shipping address, displays the billing section and sets the default address view.
   *   - If the address data is both a billing and a shipping address, hides the billing section and sets the default address view.
   *   - If the address data has address lists, hides the billing section and sets the default address view.
   */
  const handleNewUserFlow = async () => {
    await setAddressDetails(addressData, 0);

    if (!userDetails) return;

    const userRoleName = userDetails.roleName?.toLowerCase();

    if (userDetails.accountId && userDetails.accountId > 0 && userRoleName) {
      const validRoles = [ADDRESS.ADMINISTRATOR_ROLE_NAME.toLowerCase(), ADDRESS.MANAGER_ROLE_NAME.toLowerCase(), ADDRESS.USER_ROLE_NAME];
      setHideAddressButtons(!validRoles.includes(userRoleName));
      setIsHideAddEditButton(userRoleName === ADDRESS.MANAGER_ROLE_NAME.toLowerCase() || userRoleName === ADDRESS.USER_ROLE_NAME.toLowerCase());
    }

    const hasBillingAddress = isBillingAddress(addressData);
    const hasShippingAddress = isShippingAddress(addressData);

    const oneTimeAddressIds = getOneTimeAddressId();

    if (!hasBillingAddress && !hasShippingAddress && !oneTimeAddressIds.length) {
      setHideBillingSection(false);
      setIsDefaultAddressView({ isShippingAddress: true, isBillingAddress: true });
    } else if (hasBillingAddress && hasShippingAddress) {
      setHideBillingSection(true);
      setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: false });
    } else if (hasBillingAddress && !hasShippingAddress) {
      setHideBillingSection(true);
      setIsDefaultAddressView({ isShippingAddress: true, isBillingAddress: false });
    } else if (!hasBillingAddress && hasShippingAddress) {
      setHideBillingSection(true);
      setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: true });
    } else if (addressData?.addressList && addressData.addressList.length > 0) {
      setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: false });
      setHideBillingSection(true);
    } else if (oneTimeAddressIds.length > 0) {
      setHideBillingSection(true);
    }
  };

  useEffect(() => {
    if (!isGuestUser()) {
      handleNewUserFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData]);

  useEffect(() => {
    const { shippingAddress } = addressData;

    if (resetAddress && shippingAddress && !isGuestUser()) {
      setHideBillingSection(true);
      const shippingRequest = createShippingRequest(shippingAddress as ICreateShipping, shippingAddressId, billingAddressId);
      updateShippingOptions && updateShippingOptions(shippingRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetAddress]);

  const updateAddressDetails = async (addressData: IAddressList, oneTimeAddressIds: number[]): Promise<void> => {
    const latestOneTimeAddressId = oneTimeAddressIds?.at(-1);
    let oneTimeAddresses: IAddress[] = [];

    if (oneTimeAddressIds.length > 0) {
      oneTimeAddresses = await fetchOneTimeAddresses(oneTimeAddressIds);
      addressData.addressList = filterUniqueAddresses([...(addressData?.addressList || []), ...oneTimeAddresses]);
    }

    setAddressInfo(addressData);

    if (isDontSaveAddressChecked) {
      const latestAddress = oneTimeAddresses?.at(-1) ?? ({} as IAddress);

      if (latestAddress.isShipping || latestAddress.isBothBillingShipping) {
        setSelectedShippingAddress(latestAddress);
      }
      if (latestAddress.isBilling) {
        setSelectedBillingAddress(latestAddress);
      }
    } else if (oneTimeAddresses && oneTimeAddresses?.length > 0) {
      const addressIndex = oneTimeAddresses.length;
      const savedAddress = addressData.addressList?.at(-addressIndex);

      if (savedAddress?.isShipping || savedAddress?.isBothBillingShipping) {
        setSelectedShippingAddress(savedAddress);
      }
      if (savedAddress?.isBilling) {
        setSelectedBillingAddress(savedAddress);
        setBillingAddressId(savedAddress.addressId ?? 0);
      }
      if (savedAddress?.isShipping) {
        const shippingRequest = createShippingRequest(savedAddress as ICreateShipping, savedAddress?.addressId ?? 0, savedAddress?.addressId ?? 0);
        updateShippingOptions && updateShippingOptions(shippingRequest);
      }
    } else {
      setAddressHooks(addressData, latestOneTimeAddressId);
    }
  };

  const setAddressDetails = async (addressData: IAddressList, addressId: number) => {
    let oneTimeAddressIds = getOneTimeAddressId() as number[];
    if (oneTimeAddressIds.includes(addressId)) {
      oneTimeAddressIds =
        oneTimeAddressIds.length > 1
          ? oneTimeAddressIds.filter((id) => id !== addressId)
          : oneTimeAddressIds.length === 1 && oneTimeAddressIds[0] === addressId
          ? []
          : oneTimeAddressIds;
    }
    await updateAddressDetails(addressData, oneTimeAddressIds);
  };

  const setAddressHooks = (addressData: IAddressList, latestOneTimeAddressId?: number) => {
    const { shippingAddress, billingAddress } = addressData;

    // Find one-time address if the ID is provided
    const oneTimeAddress = latestOneTimeAddressId ? addressData.addressList?.find((address: IAddress) => address.addressId === latestOneTimeAddressId) : undefined;

    // Set shipping address ID
    const shippingId = shippingAddress?.addressId ?? (oneTimeAddress?.isShipping ? latestOneTimeAddressId : null);
    if (shippingId) setShippingAddressId(Number(shippingId));

    // Set billing address ID
    const billingId = billingAddress?.addressId ?? (oneTimeAddress?.isBilling ? latestOneTimeAddressId : null);
    if (billingId) setBillingAddressId(Number(billingId));

    // Set selected billing address
    const selectedBillingAddress = billingAddress?.postalCode ? billingAddress : oneTimeAddress?.isBilling ? oneTimeAddress : null;
    if (selectedBillingAddress) setSelectedBillingAddress(selectedBillingAddress);

    // Set selected shipping address
    const selectedShippingAddress = shippingAddress?.postalCode ? shippingAddress : oneTimeAddress?.isShipping ? oneTimeAddress : null;
    if (selectedShippingAddress) setSelectedShippingAddress(selectedShippingAddress);

    // Update shipping options if a valid shipping address is provided
    if (shippingAddress?.postalCode && updateShippingOptions) {
      const shippingRequest = createShippingRequest(shippingAddress as ICreateShipping, shippingAddress.addressId ?? 0, billingAddress?.addressId ?? 0);
      updateShippingMethodFlag.current && updateShippingOptions(shippingRequest);
    }
  };

  const handleChangeAddress = async (addressId: string, type: string) => {
    const updatedAddress = await fetchAddressDetailsById(parseInt(addressId));
    if (type === ADDRESS.BILLING_ADDRESS_TYPE) {
      const updateBillingAddressIdStatus = await updateBillingAddressId(Number(addressId));
      if (updateBillingAddressIdStatus) {
        setSelectedBillingAddress(updatedAddress);
        setBillingAddressId(updatedAddress.addressId ?? 0);
      }
    } else if (type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      setSelectedAddressAndId(updatedAddress, setSelectedShippingAddress, setShippingAddressId);
    }
  };

  const setSelectedAddressAndId = (address: IAddress | undefined, setAddress: any, setId: any) => {
    if (address) {
      setId(address.addressId);
      setAddress(address);
      updateShippingOptions && updateShippingOptions(createShippingRequest(address as ICreateShipping, address.addressId ?? 0, billingAddressId));
    }
  };

  const getAddressDetails = async (addressResponse: IUpdateAddressResponse) => {
    const userId = userDetails?.userId;
    if (!addressResponse?.addressModel?.addressId || addressResponse?.addressModel?.addressId <= 0) return;
    const cardNumber = await getCartNumber();
    const cartModel = await getCart(cardNumber ?? "");
    const userAddressList = await getUserAddress(userId ?? 0, true, "", 0, 0, false, cartModel);
    const userAddress = !userAddressList.addressList?.length ? { ...userAddressList, addressList: [] } : userAddressList;
    let addressOneTimeId;
    if (addressResponse?.addressModel?.dontAddUpdateAddress) {
      addressOneTimeId = addressResponse?.addressModel?.addressId;
      setOneTimeAddressId(addressOneTimeId);
      const oneTimeAddress = await fetchAddressDetailsById(addressOneTimeId); //Get AddressById API Call
      oneTimeAddress && userAddress.addressList?.push(oneTimeAddress);
    }
 
    if (addressResponse.addressType === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      userAddress.shippingAddress = addressResponse.addressModel;
    } else if (selectedShippingAddress) {
      userAddress.shippingAddress = selectedShippingAddress;
    }
    if (addressResponse.addressType === ADDRESS.BILLING_ADDRESS_TYPE) {
      userAddress.billingAddress = addressResponse.addressModel;
    } else if (selectedBillingAddress) {
      userAddress.billingAddress = selectedBillingAddress;
    }
  
    await setAddressDetails(userAddress, addressOneTimeId ?? 0);
    userAddress?.addressList && (userAddress.addressList = filterUniqueAddresses(userAddress?.addressList));
    setHideBillingSection(true);
    setAddressInfo(userAddress);

    if (![ADDRESS.SHIPPING_ADDRESS_TYPE, ADDRESS.BILLING_ADDRESS_TYPE].includes(addressResponse?.addressType)) return;

    const displayAddress = userAddress.addressList?.find((x: IAddress) => x.addressId === addressResponse?.addressModel?.addressId);
    if (!displayAddress) return;

    const billingId = displayAddress?.isBilling || displayAddress?.isBothBillingShipping ? displayAddress?.addressId : billingAddressId;
    const shippingId = displayAddress?.isShipping || displayAddress?.isBothBillingShipping ? displayAddress?.addressId : shippingAddressId;
    
    if (displayAddress?.isShipping || displayAddress?.isBothBillingShipping) {
      const shippingRequest = createShippingRequest(displayAddress as ICreateShipping, displayAddress?.addressId ?? 0, billingId ?? 0);
      updateShippingOptions && updateShippingOptions(shippingRequest);
      setShippingAddressId(displayAddress?.addressId ?? 0);
      setSelectedShippingAddress(displayAddress);
    }
    if (displayAddress?.isBilling) {
        if (billingId && shippingId) {
        const updateAddressIdsStatus = await updateAddressIds(shippingId, billingId, null);
        if(updateAddressIdsStatus)
          {
          setBillingAddressId(displayAddress?.addressId ?? 0);
          setSelectedBillingAddress(displayAddress);
        }
    }
  };
};

  const onSaveAddress = async (addressResponse: IUpdateAddressResponse, isBillingAddress: boolean) => {
    const userId = userDetails?.userId;
    const isOnlyBillingChanged = addressResponse?.addressType === ADDRESS.BILLING_ADDRESS_TYPE && !addressResponse?.addressModel.isShipping;
    updateShippingMethodFlag.current = isOnlyBillingChanged ? false : true;
    const cartNumber = await getCartNumber();
    if (!userId || userId <= 0) {
      const cartModel = await getCart(cartNumber ?? "");
      const userAddressList = await getUserAddress(userId ?? 0, true, "", 0, 0, false, cartModel);
      const userAddress = !userAddressList.addressList?.length ? { ...userAddressList, addressList: [] } : userAddressList;
      let addressOneTimeId;
      if (addressResponse?.addressModel?.dontAddUpdateAddress) {
        addressOneTimeId = addressResponse?.addressModel?.addressId;
        setOneTimeAddressId(addressOneTimeId as number);
        const oneTimeAddress = await fetchAddressDetailsById(addressResponse?.addressModel?.addressId as number); //Get AddressById API Call
        oneTimeAddress && userAddress.addressList?.push(oneTimeAddress);
      }

      await setAddressDetails(userAddress, addressOneTimeId as number);

      userAddress?.addressList && (userAddress.addressList = filterUniqueAddresses(userAddress?.addressList));
      setAddressInfo(userAddress);

      if (addressResponse?.addressModel?.isBothBillingShipping || (addressResponse?.addressModel?.isBilling && addressResponse?.addressModel?.isShipping)) {
        setSelectedBillingAddress(addressResponse?.addressModel);
        setSelectedShippingAddress(addressResponse?.addressModel);
        setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: false });
      } else if (!isBillingAddress) {
        setSelectedShippingAddress(addressResponse?.addressModel);
        if (cartModel?.billingAddress?.postalCode) {
          setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: false });
        } else {
          setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: true });
        }
      }
      setHideBillingSection(true);
    } else {
      await getAddressDetails(addressResponse);
    }

    setIsDisabled(false);
    setAddEditAddressOpen && setAddEditAddressOpen({ isShippingAddressOpen: false, isBillingAddressOpen: false });

    const reqData = {
      postalCode: addressResponse?.addressModel?.postalCode,
      countryName: addressResponse?.addressModel?.countryName,
      stateName: addressResponse?.addressModel?.stateName,
    };

    const shippingAddressId = isBillingAddress ? 0 : addressResponse?.addressModel.addressId ?? 0;
    const billingAddressKey = isBillingAddress ? addressResponse?.addressModel.addressId : billingAddressId;

    const shippingRequest = createShippingRequest(reqData, shippingAddressId, billingAddressKey ?? 0);

    if (!isBillingAddress) {
      setShippingAddressId(addressResponse?.addressModel.addressId ?? 0);
      if (!userId || userId <= 0) {
        updateShippingOptions && updateShippingOptions(shippingRequest);
      } else {
        !addressResponse?.addressModel?.postalCode && updateShippingOptions && updateShippingOptions(shippingRequest);
      }
    }

    if ((!userId || userId <= 0) && isBillingAddress && addressResponse?.cartModelResponseData?.billingAddress) {
      const guestUserDetails = await getGuestUserDetails(cartNumber);

      const { guestUserId, billingAddressId = 0, shippingAddressId = 0 } = guestUserDetails || {};
      if (guestUserId && billingAddressId > 0 && shippingAddressId > 0) {
        const updateStatus = await updateAddressIds(shippingAddressId, billingAddressId, null);
        if (updateStatus) {
          setSelectedBillingAddress(addressResponse?.cartModelResponseData?.billingAddress);
        }
      }
    }

    if (isBillingAddress) {
      setBillingAddressId(addressResponse?.addressModel.addressId ?? 0);
      if ((!userId || userId <= 0) && updateShippingMethodFlag.current) {
        updateShippingOptions && updateShippingOptions(shippingRequest);
      }
    }

    if (addressResponse?.addressModel?.isBothBillingShipping || (addressResponse?.addressModel?.isBilling && addressResponse?.addressModel?.isShipping)) {
      setSelectedBillingAddress(addressResponse?.addressModel);
      setBillingAddressId(addressResponse?.addressModel.addressId ?? 0);
      setSelectedShippingAddress(addressResponse?.addressModel);
      setIsDefaultAddressView({ isShippingAddress: false, isBillingAddress: false });
    } else if (!isBillingAddress) {
      setSelectedShippingAddress(addressResponse?.addressModel);
    }
    updateShippingMethodFlag.current = true;
  };

  return (
    <div className="mb-2" data-test-selector="divShippingAddress">
      <div className="flex flex-col justify-between w-full gap-6 sm:flex-row">
        <ShippingAddressSection
          userInfo={userDetails}
          addressInfo={addressInfo}
          resetForm={resetForm}
          hideAddressButtons={hideAddressButtons}
          addressList={shippingAddresses}
          onAddressChange={(addressId, type) => handleChangeAddress(addressId, type)}
          onSaveAddress={(request: IUpdateAddressResponse, isBilling: boolean) => onSaveAddress(request, isBilling)}
          selectedAddress={selectedShippingAddress}
          restrictOtherActions={setAddEditAddressOpen}
          isDefaultAddAddressView={isDefaultAddressView.isShippingAddress}
          setHideBillingSection={setHideBillingSection}
          resetAddress={resetAddress}
          enableShippingAddressSuggestion={enableShippingAddressSuggestion}
          setDontSaveAddressChecked={setIsDontSaveAddressChecked}
          isHideAddEditButton={isHideAddEditButton}
          enableAddressValidation={enableAddressValidation}
        />
      </div>

      {!isBillingAddressOptional && hideBillingSection && (
        <div className="flex flex-col justify-between w-full gap-6 mt-2 sm:flex-row">
          <BillingAddressSection
            userInfo={userDetails}
            addressInfo={addressInfo}
            hideAddressButtons={hideAddressButtons}
            addressList={billingAddresses}
            onAddressChange={(addressId, type) => handleChangeAddress(addressId, type)}
            onSaveAddress={(request: IUpdateAddressResponse, isBilling: boolean) => onSaveAddress(request, isBilling)}
            selectedAddress={selectedBillingAddress}
            restrictOtherActions={setAddEditAddressOpen}
            isDefaultAddAddressView={isDefaultAddressView.isBillingAddress}
            setDontSaveAddressChecked={setIsDontSaveAddressChecked}
            isHideAddEditButton={isHideAddEditButton}
            enableAddressValidation={enableAddressValidation}
          />
        </div>
      )}
    </div>
  );
};

export default AddressWrapper;
