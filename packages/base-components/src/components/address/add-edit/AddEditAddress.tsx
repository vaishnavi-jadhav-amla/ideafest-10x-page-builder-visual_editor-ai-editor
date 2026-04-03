/* eslint-disable max-lines-per-function */
"use client";

import { IAddAddressRequest, IAddress, IAddressFormData, IAddressList, ICountries, IEditAddressRequest } from "@znode/types/address";
import { IAnonymousUserAddressRequest, IAnonymousUserAddressResponse, IGuestUserDetails, IUpdateAddressResponse, IUser } from "@znode/types/user";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  createAnonymousUserAccount,
  createAnonymousUserAddressId,
  deleteAddress,
  getCartNumber,
  getCountryList,
  getRecommendedAddressForUser,
  getStateList,
  getUserAddressDetailsByEditModal,
  saveCheckoutAddressForUser,
  saveUserAddressBookAddress,
} from "../../../http-request";
import { formatTestSelector, getBaseUrl, isValidZipCode } from "@znode/utils/common";
import { getCart, setCart } from "@znode/agents/cart/cart-helper";
import { getGuestUserDetails, matchAddress, saveGuestUserDetails, useTranslationMessages } from "@znode/utils/component";
import { useAddress, useModal, useToast } from "../../../stores";

import { ADDRESS } from "@znode/constants/address";
import Button from "../../common/button/Button";
import { CheckboxField } from "../../common/checkbox";
import { Heading } from "../../common/heading";
import { INPUT_REGEX } from "@znode/constants/regex";
import { IShoppingCart } from "@znode/types/shopping";
import { IState } from "@znode/types/common";
import LoaderComponent from "../../common/loader-component/LoaderComponent";
import { Modal } from "../../common/modal/Modal";
import RecommendedAddress from "../recommended/RecommendedAddress";
import { SelectField } from "../../common/select";
import { TextInputField } from "../../common/hook-form";
import { processUserAddressResponse } from "@znode/agents/address/address-helper";
import { useRouter } from "next/navigation";
import { getCheckoutGuestUserDetails } from "@znode/agents/checkout/checkout-helper";
import { RadioField } from "../../common/radio-field/RadioField";

interface IAddAddress {
  backClick?: (_arg1: string) => void;
  saveClick?: (_arg1: IUpdateAddressResponse) => void;
  addAddressData: IAddAddressRequest;
  showHideBillingAddress?: (_arg1: boolean) => void;
  backClickForGuest?: (_arg1: string) => void;
  resetHandle?: boolean;
  userAddressCount?: number;
  resetAddress?: boolean;
  editAddressData: IEditAddressRequest;
  addressType?: string;
  setHideBillingSection?: Dispatch<SetStateAction<boolean>>;
  setDontSaveAddressChecked?: Dispatch<SetStateAction<boolean>>;
  selectedAddress?: IAddress;
  userDetails: IUser;
  enableAddressValidation: boolean;
}

/** Guest User Flow */
export const handleBothBillingAndShipping = async (addressResponse: IUpdateAddressResponse, cartNumber: string, shippingEmailAddress: string): Promise<boolean> => {
  const guestUserDetails = await getGuestUserDetails(cartNumber);
  let userId = guestUserDetails?.guestUserId;

  if (!userId) {
    const baseUrl = getBaseUrl();
    const guestUser = await createAnonymousUserAccount(addressResponse.addressModel, shippingEmailAddress, baseUrl);
    userId = guestUser?.userId;
    userId && saveGuestUserDetails(cartNumber, { guestUserId: userId } as IGuestUserDetails);
  }

  if (userId) {
    addressResponse.addressModel.userId = userId;
    const addressRequest: IAnonymousUserAddressRequest = {
      address: addressResponse.addressModel,
      isBothBillingShipping: true,
    };
    const newUserAddress: IAnonymousUserAddressResponse = await createAnonymousUserAddressId(addressRequest);

    const isGuestUserDetails = await processUserAddressResponse(newUserAddress, cartNumber, addressResponse.addressModel, addressResponse.addressModel);

    if (isGuestUserDetails) {
      const guestUserDetails: IGuestUserDetails = {
        guestUserId: userId,
        shippingAddressId: newUserAddress?.shippingAddressId ?? 0,
        billingAddressId: newUserAddress?.billingAddressId ?? 0,
        billingAddress: newUserAddress?.billingAddress,
      };
      saveGuestUserDetails(cartNumber, guestUserDetails);
    }

    return isGuestUserDetails;
  }

  return false;
};

const handleSingleAddressType = async (addressResponse: IUpdateAddressResponse, guestUserCart: IShoppingCart, addressType: string, cartNumber: string): Promise<boolean> => {
  const isBillingAddress = addressType === ADDRESS.BILLING_ADDRESS_TYPE;
  const isShippingAddress = addressType === ADDRESS.SHIPPING_ADDRESS_TYPE;

  const guestUserDetails = await getGuestUserDetails(cartNumber);
  const userId = guestUserDetails?.guestUserId;

  if (isBillingAddress) {
    guestUserCart.billingAddress = addressResponse.cartModelResponseData?.billingAddress;
    if (userId && guestUserCart.billingAddress) {
      guestUserCart.billingAddress.userId = userId;
    }
  }

  if (isShippingAddress) {
    guestUserCart.shippingAddress = addressResponse.cartModelResponseData?.shippingAddress;
    if (userId && guestUserCart.shippingAddress) {
      guestUserCart.shippingAddress.userId = userId;
    }
  }

  await setCart(guestUserCart, true, cartNumber);

  if (guestUserCart && guestUserCart.shippingAddress && guestUserCart.shippingAddress?.emailAddress && !userId) {
    const baseUrl = getBaseUrl();
    const guestUser = await createAnonymousUserAccount(guestUserCart.shippingAddress, guestUserCart.shippingAddress.emailAddress, baseUrl);

    if (guestUser?.userId) {
      saveGuestUserDetails(cartNumber, { guestUserId: guestUser.userId } as IGuestUserDetails);
      guestUserCart.shippingAddress.userId = guestUser.userId;
    }
  }

  const addressRequest = {
    isBothBillingShipping: false,
    [isShippingAddress ? "shippingAddress" : "billingAddress"]: isShippingAddress ? guestUserCart.shippingAddress : guestUserCart.billingAddress,
  };

  const userAddressResponse: IAnonymousUserAddressResponse = await createAnonymousUserAddressId(addressRequest);
  const isGuestUserDetails = await processUserAddressResponse(userAddressResponse, cartNumber, guestUserCart.shippingAddress ?? {}, guestUserCart.billingAddress ?? {});

  if (isGuestUserDetails) {
    const guestUserDetails: IGuestUserDetails = {
      guestUserId: (userId || getGuestUserDetails(cartNumber)?.guestUserId) ?? 0,
      shippingAddressId: (userAddressResponse?.shippingAddressId || getGuestUserDetails(cartNumber)?.shippingAddressId) ?? 0,
      billingAddressId: (userAddressResponse?.billingAddressId || getGuestUserDetails(cartNumber)?.billingAddressId) ?? 0,
      billingAddress: userAddressResponse?.billingAddress,
    };
    saveGuestUserDetails(cartNumber, guestUserDetails);
    return isGuestUserDetails;
  }

  return false;
};

export const saveGuestUserAddress = async (addressResponse: IUpdateAddressResponse, inputAddress: IAddress, addressType: string): Promise<boolean> => {
  let status = false;

  const cartNumber = await getCartNumber();
  const guestUserCart: IShoppingCart = (await getCart(cartNumber ?? "")) || ({} as IShoppingCart);

  if (cartNumber) {
    if (inputAddress.isBothBillingShipping && addressResponse.addressModel.emailAddress) {
      status = await handleBothBillingAndShipping(addressResponse, cartNumber, addressResponse.addressModel.emailAddress);
    } else if (inputAddress.isBothBillingShipping === false || (!inputAddress?.isBilling && inputAddress?.isShipping) || (inputAddress?.isBilling && !inputAddress?.isShipping)) {
      status = await handleSingleAddressType(addressResponse, guestUserCart, addressType, cartNumber);
    }
  }

  return status;
};

/** Guest user flow end */
export function AddEditAddress({
  resetHandle,
  resetAddress,
  userAddressCount,
  addAddressData,
  saveClick,
  backClickForGuest,
  backClick,
  editAddressData,
  addressType,
  setHideBillingSection,
  setDontSaveAddressChecked,
  selectedAddress,
  userDetails,
  enableAddressValidation = false,
}: IAddAddress) {
  const addressTranslation = useTranslationMessages("Address");

  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const { error, success } = useToast();
  const { countries, setCountries, stateListData, setStateListData } = useAddress();

  const { isGuestUser, type, userId, addressListCount } = addAddressData;
  const isFromAddressBook = type === ADDRESS.ADDRESS_BOOK_TYPE;

  const [stateList, setStateList] = useState<IState[]>(stateListData);
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [selectedState, setSelectedState] = useState<string>();
  const [isBothBillingShippingText, setIsBothBillingShippingText] = useState<string>();
  const [isSameAsBillingShippingChecked, setSameAsBillingShippingChecked] = useState<boolean>(true);
  const [hideSetAsDefault, setHideSetAsDefault] = useState<boolean>(false);
  const [enteredAddress, setEnteredAddress] = useState<IAddress>();
  const [recommendedAddress, setRecommendedAddress] = useState<IAddressList>();
  const [postalCodeError, setPostalCodeError] = useState<string>("");
  const [isSetAsDefaultChecked, setIsSetAsDefaultChecked] = useState<boolean>(true);
  const [isSetAsDefaultDisabled, setIsSetAsDefaultDisabled] = useState<boolean>(true);
  const [isSameAsBillingDisabled, setIsSameAsBillingDisabled] = useState<boolean>(false);
  const [fetchedAddressData, setFetchedAddressData] = useState<IAddress>();
  const [isDefaultShippingChecked, setDefaultShippingChecked] = useState<boolean>(false);
  const [isDefaultShippingDisabled, setDefaultShippingDisabled] = useState<boolean>(false);
  const [isDefaultBillingChecked, setDefaultBillingChecked] = useState<boolean>(false);
  const [isDefaultBillingDisabled, setDefaultBillingDisabled] = useState<boolean>(false);
  const [editAddressModel, setEditAddressModel] = useState<IEditAddressRequest>();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<IAddressFormData>({ mode: "onBlur" , defaultValues: { isCommercial: ADDRESS.COMMERCIAL } });

  const resetFormFields = (formData: IAddressFormData) => {
    const {
      firstName,
      address1,
      address2,
      cityName,
      emailAddress,
      displayName,
      isBothBillingShipping,
      dontAddUpdateAddress,
      isDefaultBilling,
      isDefaultShipping,
      lastName,
      phoneNumber,
      postalCode,
      companyName,
    } = formData;

    reset({
      firstName,
      address1,
      address2,
      cityName,
      emailAddress,
      displayName,
      isBothBillingShipping,
      dontAddUpdateAddress,
      isDefaultBilling,
      isDefaultShipping,
      lastName,
      phoneNumber,
      postalCode,
      companyName,
    });
    const defaultCheck = addressType === "Shipping" ? isDefaultShipping : isDefaultBilling;
    setIsSetAsDefaultChecked(defaultCheck as boolean);
  };

  const handleChangeCountry = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    fetchStateData(e.target.value, undefined, true);
  };

  const handleChangeState = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  const renderIsBothBillingShippingText = (typeText: string) => {
    if (typeText === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      setIsBothBillingShippingText(addressTranslation("checkBoxTextShippingBillingSame"));
    } else if (typeText === ADDRESS.BILLING_ADDRESS_TYPE) {
      setIsBothBillingShippingText(addressTranslation("checkboxSameAsShipping"));
      setSameAsBillingShippingChecked(false);
    }
  };

  useEffect(() => {
    closeModal();
    if (isGuestUser) {
      setIsSameAsBillingDisabled(false);
    }

    !countries.length && fetchCountriesStateData();
    if (!isFromAddressBook) {
      renderIsBothBillingShippingText(type);
    }

    if (userAddressCount && userAddressCount > 0) {
      if (type === (ADDRESS.SHIPPING_ADDRESS_TYPE || "shipping") && addAddressData?.hasDefaultShippingAddress) {
        setIsSetAsDefaultChecked(false);
        setIsSetAsDefaultDisabled(false);
        setIsSameAsBillingDisabled(false);
      } else if (type === (ADDRESS.BILLING_ADDRESS_TYPE || "billing") && addAddressData.hasDefaultBillingAddress) {
        setIsSetAsDefaultChecked(false);
        setIsSetAsDefaultDisabled(false);
      }
    }

    if (addressType === "Edit") {
      setEditAddressModel(editAddressData);
    }

    if (stateListData.length) {
      setStateList(stateListData);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resetAddress) {
      setIsSetAsDefaultChecked(true);
      setIsSetAsDefaultDisabled(true);
      setIsSameAsBillingDisabled(true);
    }
  }, [resetAddress]);

  useEffect(() => {
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeModal]);

  useEffect(() => {
    resetHandle && reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetHandle]);

  const fetchCountriesStateData = async () => {
    const countryList = await getCountryList();
    if (countryList?.length > 0 && countryList[0].countryCode) {
      setCountries(countryList);
      fetchStateData(countryList[0].countryCode, countryList);
    }
  };

  const fetchStateData = async (countryCode: string, countryList?: ICountries[], hasCountryChanged = false) => {
    if (countryCode) {
      const stateList = await getStateList(countryCode);
      setStateList(stateList);
      hasCountryChanged && stateList && stateList.length > 0 && setSelectedState(stateList[0].stateCode);
      countryList && countryCode === countryList[0]?.countryCode && setStateListData(stateList);
    }
  };

  const renderCountries = () => {
    return (
      countries &&
      countries.map((country: ICountries, index: number) => {
        return (
          <option value={country.countryCode} selected={country.countryCode === fetchedAddressData?.countryName} key={`${country.countryId}-${index}`}>
            {country.countryName}
          </option>
        );
      })
    );
  };

  const saveAddAddress = async (address: IAddress, addressType: string) => {
    if (isFromAddressBook) {
      saveAddressBookAddress(address, addressType);
    } else {
      saveCheckoutAddress(address, addressType);
    }
  };

  const saveAddressBookAddress = async (address: IAddress, addressType: string) => {
    let cartModel;
    const cartNumber = await getCartNumber();
    if (isGuestUser) cartModel = await getCart(cartNumber ?? "");

    const addressDetails = await saveUserAddressBookAddress(address, addressType, cartModel as IShoppingCart);
    if (!addressDetails?.hasError) {
      setLoading(false);
      success(addressTranslation(addressDetails?.successMessage));
      router.push("/account/address-book");
    } else {
      error(addressDetails?.errorMessage ?? "");
    }
  };

  const saveCheckoutAddress = async (address: IAddress, addressType: string) => {
    let cartModel;
    let addressStatus = true;
    const addressResponse = await saveCheckoutAddressForUser(address, true, addressType, cartModel);
    if (isGuestUser) {
      addressStatus = (await saveGuestUserAddress(addressResponse, address, addressType)) || false;
    }

    if (isGuestUser) {
      if (addressResponse?.status && saveClick && addressStatus) {
        setLoading(false);
        saveClick(addressResponse);
      } else if (!addressStatus && addressType === ADDRESS.SHIPPING_ADDRESS_TYPE && saveClick) {
        saveClick(addressResponse);
        setLoading(false);
      } else if (!addressStatus && addressType === ADDRESS.BILLING_ADDRESS_TYPE && saveClick) {
        saveClick(addressResponse);
        setLoading(false);
      }
    } else {
      if (addressResponse?.status && saveClick && addressStatus) {
        setLoading(false);
        saveClick(addressResponse);
      }
    }
  };

  const getRecommendedAddress = async (userEnteredAddress: IAddress) => {
    const recommendedAddress = await getRecommendedAddressForUser(userEnteredAddress);
    if (type) {
      if (recommendedAddress?.addressList && recommendedAddress?.addressList?.length > 0 && userEnteredAddress) {
        const isRecommendedAddressMatched = await matchAddress(recommendedAddress, userEnteredAddress);
        if (isRecommendedAddressMatched) {
          saveAddAddress(userEnteredAddress, type);
        } else {
          setRecommendedAddress(recommendedAddress);
          setEnteredAddress(userEnteredAddress);
          //Recommended Address Popup open
          openModal("RecommendedAddress");
          document.body.classList.add("overflow-hidden");
        }
      } else {
        saveAddAddress(userEnteredAddress, type);
      }
    }
  };

  const postalCodeValidator = async (postalCode: string, countryCode: string) => {
    const isValidPostalCode = await isValidZipCode(postalCode, countryCode);
    if (isValidPostalCode) {
      setPostalCodeError("");
    } else {
      setPostalCodeError(addressTranslation("validationZipCode"));
      setLoading(false);
    }

    return isValidPostalCode;
  };

  const renderStates = () => {
    return (
      stateList &&
      stateList?.map((state) => {
        return (
          <option value={state.stateCode} selected={state.stateCode === fetchedAddressData?.stateCode} key={state.stateId}>
            {state.stateName}
          </option>
        );
      })
    );
  };

  const showHideSetAsDefault = (value: boolean) => {
    if (value) hideSetAsDefault ? setHideSetAsDefault(false) : setHideSetAsDefault(true);
    if (value && setDontSaveAddressChecked) hideSetAsDefault ? setDontSaveAddressChecked(false) : setDontSaveAddressChecked(true);
  };

  const showHideShippingBillingAddressContainer = () => {
    if (type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      if (isSameAsBillingShippingChecked) {
        setSameAsBillingShippingChecked(false);
        //Hide billing display address
        setHideBillingSection && setHideBillingSection(true);
      } else {
        setSameAsBillingShippingChecked(true);
        //Display billing display address
        setHideBillingSection && setHideBillingSection(false);
      }
    } else if (type === ADDRESS.BILLING_ADDRESS_TYPE) {
      setSameAsBillingShippingChecked(!isSameAsBillingShippingChecked);
    }
    if (setDontSaveAddressChecked) hideSetAsDefault ? setDontSaveAddressChecked(true) : setDontSaveAddressChecked(false);
  };

  const handleSelectedRecommendedAddress = (selectedUserAddress: IAddress) => {
    saveAddAddress(selectedUserAddress, type);
    closeModal();
    document.body.classList.remove("overflow-hidden");
  };

  const handleIsDefaultCheckboxChange = (defaultChecked: boolean) => {
    setDontSaveAddressChecked && setDontSaveAddressChecked(false);
    if (defaultChecked) {
      setIsSetAsDefaultChecked(false);
    } else {
      setIsSetAsDefaultChecked(true);
    }
  };

  /** Click on Back Button  Guest and Retail */
  const manageBackClick = (role: string) => {
    role === ADDRESS.GUEST ? backClickForGuest && backClickForGuest(type) : backClick && backClick(type);
  };

  /** Function called Saved address button click */
  const onSubmit: SubmitHandler<IAddressFormData> = async (addressFormData: IAddressFormData) => {
    if (!isValid) {
      return;
    }
    if (isGuestUser && !addressFormData?.emailAddress) {
      const cartNumber = await getCartNumber();
      const guestUserDetails = await getCheckoutGuestUserDetails(cartNumber ?? "");
      if (!guestUserDetails?.shippingAddressId && !guestUserDetails?.billingAddressId) {
        error(addressTranslation("requiredShippingAddress"));
        return;
      }
    }

    setLoading(true);
    let newAddress: IAddress = addressFormData as IAddress;

    if (addressType === "Add" || editAddressModel?.addressId === 0 || userAddressCount === 0) {
      const { isDefaultBilling, isBothBillingShipping, isDefaultShipping } = addressFormData;
      newAddress.dontAddUpdateAddress = hideSetAsDefault;
      newAddress.addressId = 0;

      if (!isGuestUser && type === ADDRESS.BILLING_ADDRESS_TYPE) {
        newAddress.isDefaultBilling = (addressType === ADDRESS.ADD_ADDRESS && userAddressCount === 0) || (isDefaultBilling ?? isSetAsDefaultChecked);
        newAddress.isBothBillingShipping = isSameAsBillingShippingChecked ?? isBothBillingShipping;
      }

      if (!isGuestUser && type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
        newAddress.isDefaultShipping = (addressType === ADDRESS.ADD_ADDRESS && userAddressCount === 0) || (isDefaultShipping ?? isSetAsDefaultChecked);
        newAddress.isBothBillingShipping = isSameAsBillingShippingChecked ?? isBothBillingShipping;
      }

      if (type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
        newAddress.isShipping = true;
        newAddress.isBilling = false;
        newAddress.addressType = ADDRESS.SHIPPING_ADDRESS_TYPE;
      } else if (type === ADDRESS.BILLING_ADDRESS_TYPE) {
        newAddress.isBilling = true;
        newAddress.isShipping = false;
        newAddress.addressType = ADDRESS.BILLING_ADDRESS_TYPE;
      } else if (type === ADDRESS.ADDRESS_BOOK_TYPE) {
        if (!addressListCount) {
          newAddress.isDefaultShipping = true;
          newAddress.isDefaultBilling = true;
        }
      }

      if (isGuestUser && type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
        newAddress.isBothBillingShipping = isSameAsBillingShippingChecked ?? isBothBillingShipping;
        if (newAddress.isBothBillingShipping) {
          newAddress.isDefaultBilling = isDefaultBilling ?? isSetAsDefaultChecked;
        }
      }
    } else {
      const { displayName, firstName, lastName, phoneNumber, companyName, address1, address2, postalCode, cityName } = addressFormData;
      const editNewAddress: IAddress = {
        displayName: displayName || fetchedAddressData?.displayName,
        firstName: firstName || fetchedAddressData?.firstName,
        lastName: lastName || fetchedAddressData?.lastName,
        phoneNumber: phoneNumber || fetchedAddressData?.phoneNumber,
        companyName: companyName ?? fetchedAddressData?.companyName,
        address1: address1 || fetchedAddressData?.address1,
        address2: address2 ?? fetchedAddressData?.address2,
        postalCode: postalCode || fetchedAddressData?.postalCode,
        cityName: cityName || fetchedAddressData?.cityName,
      };

      if (isGuestUser) {
        editNewAddress.emailAddress = addressFormData.emailAddress ? addressFormData.emailAddress : fetchedAddressData?.emailAddress;
      }
      if (type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
        fetchedAddressData?.isDefaultShipping ? (editNewAddress.isDefaultShipping = true) : (editNewAddress.isDefaultShipping = isSetAsDefaultChecked);
      } else if (type === ADDRESS.BILLING_ADDRESS_TYPE) {
        fetchedAddressData?.isDefaultBilling ? (editNewAddress.isDefaultBilling = true) : (editNewAddress.isDefaultBilling = isSetAsDefaultChecked);
      }
      isSameAsBillingShippingChecked ? (editNewAddress.isBothBillingShipping = true) : (editNewAddress.isBothBillingShipping = addressFormData.isBothBillingShipping);
      newAddress = { ...newAddress, ...editNewAddress };
    }

    // For guest users editing their billing address, explicitly set isBothBillingShipping to false.
    // This prevents the edited billing address from unintentionally overwriting or becoming the shipping address.
    if (isGuestUser && addressType === "Edit" && type === ADDRESS.BILLING_ADDRESS_TYPE) {
      newAddress.isBothBillingShipping = false;
    }

    newAddress.stateName = selectedState ? selectedState : stateList?.length ? stateList[0]?.stateCode : "";
    if (!(addressType === ADDRESS.ADD_ADDRESS)) newAddress.addressId = (fetchedAddressData && fetchedAddressData.addressId) || (editAddressData && editAddressData?.addressId);

    newAddress.userId = userId || userDetails?.userId || 0;
    newAddress.accountId = userDetails?.accountId || 0;
    newAddress.countryName = selectedCountry ? selectedCountry : countries?.length ? countries[0]?.countryCode : "";

    if (hideSetAsDefault) {
      newAddress.isDefaultShipping = false;
      newAddress.isDefaultBilling = false;
    }

    if (type === ADDRESS.ADDRESS_BOOK_TYPE) {
      newAddress.isDefaultShipping = isDefaultShippingChecked ?? addressFormData?.isDefaultShipping;
      newAddress.isDefaultBilling = isDefaultBillingChecked ?? addressFormData?.isDefaultBilling;
    }

    let isValidPostalCode = true;
    if (newAddress?.postalCode && newAddress?.countryName) {
      const validPostCodeResponse = await postalCodeValidator(newAddress?.postalCode, newAddress?.countryName);
      isValidPostalCode = validPostCodeResponse;
    }

    newAddress.isCommercial = addressFormData.isCommercial === ADDRESS.COMMERCIAL;
    if (isValidPostalCode) {
      if (enableAddressValidation) {
        getRecommendedAddress(newAddress);
      } else {
        saveAddAddress(newAddress, type);
      }
    }
  };

  const fetchAddress = async () => {
    let cartModel;
    if (isGuestUser) {
      const cardNumber = await getCartNumber();
      cartModel = await getCart(cardNumber ?? "");
    }
    const address = await getUserAddressDetailsByEditModal(editAddressData, cartModel as IShoppingCart);

    if (address.hasError) router.push("/404");
    if (isGuestUser && address?.isShipping && !address?.isBilling && !cartModel?.billingAddress) {
      setHideBillingSection && setHideBillingSection(true);
    } else {
      setHideBillingSection && setHideBillingSection(!address?.isBilling && !address?.isShipping);
    }
    setFetchedAddressData(address);
    resetFormFields(address as IAddressFormData);
    setSelectedCountry(address?.countryName);
    setSelectedState(address?.stateName);
    setDefaultShippingChecked(address?.isDefaultShipping ?? false);
    setDefaultBillingChecked(address?.isDefaultBilling ?? false);
    setValue("isCommercial", address.isCommercial === true ? ADDRESS.COMMERCIAL : ADDRESS.RESIDENTIAL);
    setSameAsBillingShippingChecked((address?.isBilling && address?.isShipping) ?? true);
    setDefaultBillingDisabled(address?.isDefaultBilling ?? false);
    setDefaultShippingDisabled(address?.isDefaultShipping ?? false);
    setIsSetAsDefaultDisabled(type === ADDRESS.SHIPPING_ADDRESS_TYPE ? address?.isDefaultShipping ?? false : address?.isDefaultBilling ?? false);
    address?.countryName && fetchStateData(address?.countryName);
  };

  /**
   * This useEffect hook is triggered whenever the addressType prop changes.
   * If the addressType is "Edit" or if editAddressModel exists and has a non-zero AddressId:
   *   - It closes any modal using the closeModal function.
   *   - It fetches address details using the fetchAddress function.
   *   - It updates the text related to billing and shipping using renderIsBothBillingShippingText function.
   */
  useEffect(() => {
    if (addressType === "Edit" || (editAddressModel && editAddressModel?.addressId > 0)) {
      closeModal();
      fetchAddress();
      renderIsBothBillingShippingText(type);
    }
    if (!(addressListCount && addressListCount > 0)) {
      setDefaultShippingChecked(true);
      setDefaultBillingChecked(true);
      setDefaultBillingDisabled(true);
      setDefaultShippingDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressType]);

  /**
   * Deletes the currently fetched address asynchronously.
   * If fetchedAddressData exists:
   *   - Calls deleteUserCurrentAddress function to delete the address.
   *   - Displays a success message if the deletion is successful.
   *   - Displays an error message if the deletion fails.
   *   - Redirects the user to the address book page ("/account/address-book") after deletion.
   */

  const deleteCurrentAddress = async () => {
    if (fetchedAddressData) {
      const message = await deleteAddress({ addressId: fetchedAddressData.addressId ?? 0 });
      message === ADDRESS.SUCCESS_DELETE_ADDRESS ? success(addressTranslation("successDeleteAddress")) : error(addressTranslation(message));
      router.push("/account/address-book");
    }
  };

  const renderAddEditForm = () => {
    if (!fetchedAddressData && addressType === ADDRESS.EDIT_ADDRESS) {
      return <LoaderComponent isLoading={true} width="50px" height="50px" />;
    }
    return (
      <form onSubmit={handleSubmit(onSubmit)} method="post">
        <div className="grid-cols-2 gap-4 sm:grid">
          <div className="col-span-1">
          <div>
              <div className="pb-2 required">
                <label className="font-semibold" data-test-selector={formatTestSelector("lbl", "addressType")}>
                  {ADDRESS.ADDRESS_TYPE}
                  <strong className="ml-1 text-errorColor">*</strong>
                </label>
              </div>
              <div className="flex justify-start items-center flex-wrap gap-4 py-2">
                <RadioField label={ADDRESS.LABEL_COMMERCIAL} value={ADDRESS.COMMERCIAL} name={"isCommercial"} register={register} />
                <RadioField label={ADDRESS.LABEL_RESIDENTIAL} name="isCommercial" register={register} value={ADDRESS.RESIDENTIAL} />
              </div>
            </div>
            {!isGuestUser && (
              <TextInputField
                label={addressTranslation("displayName")}
                name="displayName"
                placeholder="Examples: Home, Grandma, Dad, Aunt Sally"
                register={register}
                error={errors?.displayName}
                requiredErrorMessage={addressTranslation("errorDisplayNameRequired")}
                lengthErrorMessage={addressTranslation("displayNameLengthExceeded")}
                defaultValue={fetchedAddressData?.displayName ?? ""}
              />
            )}
            <TextInputField
              label={addressTranslation("firstName")}
              name="firstName"
              register={register}
              error={errors?.firstName}
              //TODO:regex validation according to 9x for now
              // pattern={{ value: INPUT_REGEX.ALPHA_NUMERIC_CHARACTER_REGEX, message: addressTranslation("onlyAlphaNumericAllowed") }}
              requiredErrorMessage={addressTranslation("requiredFirstName")}
              lengthErrorMessage={addressTranslation("firstNameLengthExceeded")}
              defaultValue={fetchedAddressData?.firstName}
            />
            <TextInputField
              label={addressTranslation("lastName")}
              name="lastName"
              register={register}
              error={errors?.lastName}
              //TODO:regex validation according to 9x for now
              // pattern={{ value: INPUT_REGEX.ALPHA_NUMERIC_CHARACTER_REGEX, message: addressTranslation("onlyAlphaNumericAllowed") }}
              requiredErrorMessage={addressTranslation("requiredLastName")}
              lengthErrorMessage={addressTranslation("lastNameLengthExceeded")}
              defaultValue={fetchedAddressData?.lastName}
            />
            <TextInputField
              label={addressTranslation("phoneNumber")}
              name="phoneNumber"
              register={register}
              maxLength={30}
              error={errors?.phoneNumber}
              requiredErrorMessage={addressTranslation("requiredPhoneNumber")}
              lengthErrorMessage={addressTranslation("phoneNumberValidation")}
              defaultValue={fetchedAddressData?.phoneNumber}
            />
            <TextInputField
              label={addressTranslation("companyName")}
              name="companyName"
              register={register}
              placeholder="Enter company name"
              error={errors.companyName}
              lengthErrorMessage={addressTranslation("companyNameLengthExceeded")}
              defaultValue={fetchedAddressData?.companyName}
            />
          </div>
          <div className="col-span-1">
            <TextInputField
              label={addressTranslation("streetAddress")}
              name="address1"
              register={register}
              error={errors.address1}
              requiredErrorMessage={addressTranslation("requiredStreetAddress")}
              lengthErrorMessage={addressTranslation("streetAddressLengthExceeded")}
              defaultValue={fetchedAddressData?.address1}
            />
            <TextInputField
              label={addressTranslation("streetAddress2")}
              name="address2"
              register={register}
              error={errors.address2}
              lengthErrorMessage={addressTranslation("streetAddressLengthExceeded")}
              defaultValue={fetchedAddressData?.address2}
            />
            <SelectField label={addressTranslation("country")} name="Country" aria-label="Country" options={renderCountries()} onChange={handleChangeCountry} />
            <SelectField label={addressTranslation("state")} name="State" aria-label="State" options={renderStates()} onChange={handleChangeState} />
            <TextInputField
              label={addressTranslation("postalCode")}
              name="postalCode"
              register={register}
              error={errors?.postalCode}
              maxLength={10}
              requiredErrorMessage={addressTranslation("requiredPostalCode")}
              lengthErrorMessage={addressTranslation("postalCodeLengthExceeded")}
              customError={postalCodeError}
              defaultValue={fetchedAddressData?.postalCode}
            />
            <TextInputField
              label={addressTranslation("city")}
              name="cityName"
              register={register}
              error={errors?.cityName}
              requiredErrorMessage={addressTranslation("requiredCity")}
              lengthErrorMessage={addressTranslation("cityNameLengthExceeded")}
              defaultValue={fetchedAddressData?.cityName}
            />
            {isGuestUser && type !== ADDRESS.BILLING_ADDRESS_TYPE && (
              <TextInputField
                label={addressTranslation("emailAddress")}
                name="emailAddress"
                register={register}
                pattern={{ value: INPUT_REGEX.EMAIL_REGEX, message: addressTranslation("emailPatternMessage") }}
                error={errors?.emailAddress}
                maxLength={250}
                requiredErrorMessage={addressTranslation("requiredEmailAddress")}
                lengthErrorMessage={addressTranslation("emailLengthValidation")}
                type="email"
              />
            )}

            {isFromAddressBook && (
              <div>
                <CheckboxField
                  label={addressTranslation("setDefaultShippingAddress")}
                  name="isDefaultShipping"
                  register={register}
                  onChange={() => setDefaultShippingChecked(!isDefaultShippingChecked)}
                  checked={isDefaultShippingChecked}
                  disabled={isDefaultShippingDisabled}
                />
                <CheckboxField
                  label={addressTranslation("setDefaultBillingAddress")}
                  name="isDefaultBilling"
                  register={register}
                  onChange={() => setDefaultBillingChecked(!isDefaultBillingChecked)}
                  checked={isDefaultBillingChecked}
                  disabled={isDefaultBillingDisabled}
                />
              </div>
            )}
            {!isFromAddressBook && !hideSetAsDefault && (type === ADDRESS.SHIPPING_ADDRESS_TYPE || type === ADDRESS.BILLING_ADDRESS_TYPE) && !isGuestUser && (
              <CheckboxField
                label={addressTranslation("setAsDefault")}
                name={type === ADDRESS.SHIPPING_ADDRESS_TYPE ? "isDefaultShipping" : "isDefaultBilling"}
                register={register}
                checked={isSetAsDefaultChecked}
                disabled={isSetAsDefaultDisabled}
                onChange={() => handleIsDefaultCheckboxChange(isSetAsDefaultChecked)}
              />
            )}
            {!isFromAddressBook && (isGuestUser ? type === ADDRESS.SHIPPING_ADDRESS_TYPE : true) && (
              <CheckboxField
                label={isBothBillingShippingText || ""}
                name="isBothBillingShipping"
                register={register}
                onChange={() => showHideShippingBillingAddressContainer()}
                checked={isSameAsBillingShippingChecked}
                disabled={isSameAsBillingDisabled}
              />
            )}

            {!isFromAddressBook && !isGuestUser && (
              <CheckboxField
                label={addressTranslation("don’tSaveThisAddress")}
                name="dontAddUpdateAddress"
                register={register}
                onChange={() => showHideSetAsDefault(true)}
                checked={hideSetAsDefault}
              />
            )}
            <div className="flex items-center justify-end pb-2 mt-3 text-right xs:text-xs xs:p-1">
              <Button
                htmlType="submit"
                type="primary"
                size="small"
                className="m-0"
                dataTestSelector="btnSaveChanges"
                ariaLabel="Save changes"
                disabled={loading}
                loading={loading}
                showLoadingText={true}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
              >
                {addressTranslation("saveChanges")}
              </Button>

              {!isFromAddressBook && (
                <Button
                  type="secondary"
                  size="small"
                  dataTestSelector={formatTestSelector("btn", `${type}Back`)}
                  className="ml-3"
                  onClick={() => manageBackClick(!isGuestUser ? ADDRESS.RETAIL : ADDRESS.GUEST)}
                  disabled={!isGuestUser ? (userAddressCount && userAddressCount > 0 ? false : true) : fetchedAddressData ? false : selectedAddress ? false : true}
                  ariaLabel="address back button"
                >
                  {addressTranslation("back")}
                </Button>
              )}
              {isFromAddressBook && editAddressModel && !(fetchedAddressData?.isDefaultBilling || fetchedAddressData?.isDefaultShipping) && editAddressModel?.addressId > 0 && (
                <Button
                  type="secondary"
                  className="ml-3"
                  dataTestSelector={formatTestSelector("btn", `${type}EditDeleteThisAddress`)}
                  onClick={deleteCurrentAddress}
                  ariaLabel="delete edit address button"
                >
                  {addressTranslation("deleteThisAddress")}
                </Button>
              )}
              {isFromAddressBook && (
                <Button type="secondary" onClick={() => router.push("/account/address-book")} dataTestSelector="btnCancel" className="ml-3 leading-tight">
                  {addressTranslation("cancel")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  };

  return (
    <>
      {isFromAddressBook && (
        <div data-test-selector="divCheckout">
          <Heading
            name={editAddressModel && editAddressModel.addressId > 0 ? addressTranslation("editAddress") : addressTranslation("addAddress")}
            customClass="mt-0 uppercase"
            level="h2"
            showSeparator
            dataTestSelector={`hdg${editAddressModel && editAddressModel.addressId > 0 ? "EditAddress" : "AddAddress"}`}
          />
        </div>
      )}
      {addressType === (ADDRESS.ADD_ADDRESS || "Add") ||
      isGuestUser ||
      (!fetchedAddressData && !userAddressCount && userAddressCount === 0) ||
      editAddressModel?.addressId === 0 ? (
        renderAddEditForm()
      ) : (addressType === ADDRESS.EDIT_ADDRESS && fetchedAddressData) || (editAddressModel && editAddressModel.addressId > 0 && fetchedAddressData) ? (
        renderAddEditForm()
      ) : (
        <LoaderComponent isLoading={true} width="50px" height="50px" />
      )}

      {recommendedAddress && enteredAddress && (
        <Modal size="5xl" modalId="RecommendedAddress" maskedCloseModal={() => handleSelectedRecommendedAddress(enteredAddress)} isMaskedModal={true}>
          <RecommendedAddress enteredAddress={enteredAddress} recommendedAddress={recommendedAddress} update={handleSelectedRecommendedAddress} />
        </Modal>
      )}
    </>
  );
}
