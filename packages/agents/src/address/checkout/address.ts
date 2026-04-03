import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ExpandCollection, ExpandKeys, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase, getPortalHeader } from "@znode/utils/server";
import { IAddress, IAddressList, IEditAddressRequest } from "@znode/types/address";
import { IShoppingCart, IUpdateOrderPayment, IUpdateOrderShipment } from "@znode/types/shopping";
import { Payments_payments, Shippings_orderShipment } from "@znode/clients/cp";
import { Shipping_recommendedAddress, WebStoreAccount_createAccountAddress, WebStoreAccount_updateAccountAddress } from "@znode/clients/v1";
import { getAddressById, getUserAddressList } from "../address-book";

import { ADDRESS } from "@znode/constants/address";
import { Address_getAddressList } from "@znode/clients/v2";
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPortalDetail } from "@znode/types/portal";
import { IUpdateAddressResponse } from "@znode/types/user";
import { getCart } from "../../checkout";
import { getCountries } from "../../common/common";
import { getPortalDetails } from "../../portal";
import { getSavedUserSession } from "@znode/utils/common";
import { getShoppingCart } from "../../shopping/shopping";
import { getUpdateAddressResponse, mapAddressListViewModel } from "../mapper";

export async function getPortalData() {
  const portalData = await getPortalDetails();
  return portalData;
}

export function getAccountAddressExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.ZnodeAddress);
  return expands;
}

export function getAddressExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.ZnodeAddress);
  expands.add(ExpandKeys.ZnodeUser);
  return expands;
}

export async function getAnonymousUserAddressList(cartData?: IShoppingCart) {
  const cartDetails: IShoppingCart = cartData ?? ((await getShoppingCart()) || {});
  // Initialize the address view model.
  const addressListModel: IAddressList = {
    accountId: 0,
    shippingAddress: undefined,
    addressList: [],
  };

  if (cartDetails) {
    // Process shipping address if available.
    if (cartDetails.shippingAddress) {
      addressListModel.shippingAddress = cartDetails.shippingAddress;

      // Assign billing email to shipping address if available.
      if (cartDetails.billingEmail) {
        addressListModel.shippingAddress.emailAddress = cartDetails.shippingAddress.emailAddress;
      }

      // Set flag if the shipping address is also the billing address.
      if (addressListModel.shippingAddress.isBilling && addressListModel.shippingAddress.isShipping) {
        addressListModel.shippingAddress.isBothBillingShipping = true;
      }
    }
    // Process billing address if available.
    if (cartDetails.billingAddress) {
      addressListModel.billingAddress = cartDetails.billingAddress;

      // Assign the billing email to the billing address.
      addressListModel.billingAddress.emailAddress = cartDetails.billingAddress.emailAddress;

      // Set flag if the billing address is also the shipping address.
      if (addressListModel.billingAddress.isBilling && addressListModel.billingAddress.isShipping) {
        addressListModel.billingAddress.isBothBillingShipping = true;
      }
    }
  }
  return addressListModel;
}

export async function getAddressListData(userId: number, isAddressBook = false, shoppingCartData?: IShoppingCart) {
  try {
    if (isAddressBook == undefined) isAddressBook = false;

    // Determine HideAddressButton flag based on the user's role
    const user = await getSavedUserSession();
    const accountId = user?.accountId || 0;
    let hideAddressButton = false;

    if (user?.accountId && user?.accountId > 0 && user?.roleName) {
      const userRoleName = user?.roleName?.toLowerCase();
      hideAddressButton = userRoleName === ADDRESS.ADMINISTRATOR_ROLE_NAME.toLocaleLowerCase() ? false : true;
    }

    if (userId <= 0) {
      const sessionUserId = user?.userId;
      userId = Number(sessionUserId);
    }

    if (userId > 0) {
      const addressList = await getUserAddressList(userId, accountId);
      return { ...addressList, hideAddressButton };
    } else {
      const addressList = getAnonymousUserAddressList(shoppingCartData);
      return { ...addressList, hideAddressButton };
    }
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {} as IAddressList[];
  }
}

/**
 * Fetch the billing and shipping address details.
 * @param userId - The user's ID.
 * @param useCartAddress - Flag indicating whether to use the cart address.
 * @param addressType - Type of the address (Billing/Shipping).
 * @param selectedAddressId - The ID of the selected address.
 * @param alternateAddressId - An alternate address ID.
 * @param isEditMode - Whether the function is being called in edit mode.
 * @param cartDetails - The shopping cart details.
 * @returns The billing and shipping address details.
 */

export async function getBillingShippingAddress(
  userId: number,
  isCartAddress: boolean,
  type: string,
  selectedAddressId?: number,
  otherAddressId?: number,
  isEditMode = false,
  cartDetails?: IShoppingCart
): Promise<IAddressList | any> {
  try {
    const portalData = await getPortalHeader();
    const availableCountries = await getCountries(portalData.portalId);
    const addressList: IAddressList = await getAddressListData(userId, false, cartDetails);

    // Determine if the user is a guest user.
    addressList.isGuestUser = !userId || userId <= 0;
    addressList.userId = userId;

    const billingAddress = {
      countries: availableCountries,
      addressType: ADDRESS.BILLING_ADDRESS_TYPE,
    };

    const shippingAddress = {
      countries: availableCountries,
      addressType: ADDRESS.SHIPPING_ADDRESS_TYPE,
    };

    if (addressList) {
      if (isEditMode) addressList.selectedAddressId = selectedAddressId;

      if (addressList.selectedAddressId && addressList.selectedAddressId > 0 && type === ADDRESS.BILLING_ADDRESS_TYPE) {
        addressList.billingAddress = addressList.addressList?.find((address: IAddress) => address.addressId === addressList.selectedAddressId);
        if (addressList.billingAddress) {
          addressList.billingAddress.addressType = ADDRESS.BILLING_ADDRESS_TYPE;
          addressList.billingAddress.isBilling = true;
        }
      } else if (addressList.selectedAddressId && addressList.selectedAddressId > 0 && type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
        addressList.shippingAddress = addressList.addressList?.find((address: IAddress) => address.addressId === addressList.selectedAddressId);

        if (addressList.shippingAddress) {
          addressList.shippingAddress.isShipping = true;
          addressList.shippingAddress.addressType = ADDRESS.SHIPPING_ADDRESS_TYPE;
        }
      }

      //Set Billing address
      if (addressList.billingAddress && Object.keys(addressList.billingAddress).length !== 0) {
        addressList.billingAddress = addressList.addressList?.find((address: IAddress) => address.isDefaultBilling);
        if (addressList.billingAddress) {
          addressList.billingAddress.addressType = ADDRESS.BILLING_ADDRESS_TYPE;
          addressList.billingAddress.isBilling = true;
        }

        //Set Shipping address
        if (addressList.shippingAddress && Object.keys(addressList.shippingAddress).length !== 0) {
          addressList.shippingAddress = addressList.addressList?.find((address: IAddress) => address.isDefaultShipping);
          if (addressList.shippingAddress) {
            addressList.shippingAddress.isShipping = true;
            addressList.shippingAddress.addressType = ADDRESS.SHIPPING_ADDRESS_TYPE;
          }
        }

        //Add countries for shipping
        if (addressList.shippingAddress) {
          addressList.shippingAddress.addressType = ADDRESS.SHIPPING_ADDRESS_TYPE;
          addressList.shippingAddress.countries = availableCountries;
        } else {
          addressList.shippingAddress = shippingAddress;
        }

        //Add countries for billing
        if (addressList.billingAddress) {
          addressList.billingAddress.addressType = ADDRESS.BILLING_ADDRESS_TYPE;
          addressList.billingAddress.countries = availableCountries;
        } else {
          addressList.billingAddress = billingAddress;
        }
        return addressList;
      }

      const model = {
        billingAddress,
        shippingAddress,
        isGuestUser: !userId || userId <= 0,
      };
      return model;
    }
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return {} as IAddressList;
  }
}

/**
 * Updates the shipping and billing address IDs for an order.
 * @param shippingAddressId - The ID of the shipping address.
 * @param billingAddressId - The ID of the billing address.
 * @param cartNumber - The cart number associated with the order.
 * @param shippingOptionId - The ID of the selected shipping option.
 * @returns A boolean indicating the success of the update.
 */

export async function updateAddressIds(shippingAddressId: number, billingAddressId: number, cartNumber: string, shippingOptionId: number) {
  try {
    let resultStatus = false;
    if (shippingAddressId && cartNumber) {
      const updateOrderShipment: IUpdateOrderShipment = {
        classNumber: cartNumber,
        shippingAddressId: shippingAddressId,
        shippingId: shippingOptionId,
      };

      const updateOrderPayment: IUpdateOrderPayment = {
        classNumber: cartNumber,
        billingAddressId: billingAddressId,
      };
      //Shippings_shippingsPut is the API call to update ShippingAddressID and ShippingOptionID in the Database
      //Payments_paymentsPut is the API call to update BillingAddressID in the Database
      const [updateShippingResponse, updateBillingResponse] = await Promise.all([
        Shippings_orderShipment(convertPascalCase(updateOrderShipment)),
        Payments_payments(convertPascalCase(updateOrderPayment)),
      ]);

      if (updateShippingResponse?.IsSuccess && updateBillingResponse?.IsSuccess) resultStatus = true;
      return resultStatus;
    }
    return resultStatus;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return false;
  }
}

export async function editAddress(model: IEditAddressRequest, userId: number, cartModel?: IShoppingCart) {
  try {
    if (!userId) {
      if (model.type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
        return { shippingAddress: cartModel?.shippingAddress, billingAddress: cartModel?.billingAddress, type: ADDRESS.SHIPPING_ADDRESS_TYPE };
      } else if (model.type === ADDRESS.BILLING_ADDRESS_TYPE) {
        return { shippingAddress: cartModel?.shippingAddress, billingAddress: cartModel?.billingAddress, type: ADDRESS.BILLING_ADDRESS_TYPE };
      }
    }

    const addressListModel = await getBillingShippingAddress(userId, false, model.type, model?.addressId, model.otherAddressId, model?.isFromEdit, cartModel);
    return addressListModel;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return {} as IAddressList;
  }
}

export async function getUserAddressDetails(portalId: number, addressRequest: IEditAddressRequest, userInfo: { accountId?: number; userId?: number }, cartModel?: IShoppingCart) {
  let address;
  if (addressRequest.isFromEdit) {
    if (addressRequest.type !== ADDRESS.ADDRESS_BOOK_TYPE && !(addressRequest?.addressId > 0)) {
      const addressList = await editAddress(addressRequest, userInfo.userId ?? 0, cartModel);
      addressRequest.type === ADDRESS.BILLING_ADDRESS_TYPE ? (address = addressList?.billingAddress) : (address = addressList?.shippingAddress);
    } else {
      address = await getAddressById(addressRequest?.addressId, portalId, userInfo);
    }
    return address;
  }
}

export async function getRecommendedAddress(addressModel: IAddress) {
  try {
    const portalDetails = await getPortalDetails();
    let addressList: IAddressList = {
      addressList: [],
    };
    if (portalDetails && portalDetails.enableAddressValidation) {
      addressModel.portalId = portalDetails.portalId;
      addressModel.publishStateId = portalDetails.publishState;

      const recommendedAddress = await Shipping_recommendedAddress(convertPascalCase(addressModel));
      const recommendedAddressList = convertCamelCase(recommendedAddress);

      addressList = { addressList: recommendedAddressList.addressList };
      if (addressList?.addressList && addressList?.addressList?.length > 0) {
        addressList?.addressList.forEach((addressValue: IAddress) => (addressValue.addressType = addressModel?.addressType));
      }
      return addressList;
    }
    return (addressList = { addressList: [addressModel] });
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {} as IAddressList;
  }
}

export async function setAnonymousUserAddresses(portalData: IPortalDetail, addressViewModel: IAddress, addressType: string, cartModelData?: IShoppingCart) {
  const cartModel: IShoppingCart | undefined = cartModelData ?? (await getCart(portalData));
  if (cartModel) {
    if (addressType === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      cartModel.shippingAddress = addressViewModel;
      cartModel.shippingAddress.isDefaultShipping = true;
      cartModel.billingEmail = addressViewModel.emailAddress;
      cartModel.shippingAddress.stateCode = addressViewModel.stateName;
      if (addressViewModel.useSameAsShippingAddress) {
        cartModel.shippingAddress.isDefaultBilling = true;
        cartModel.billingAddress = addressViewModel;
        cartModel.billingAddress.isDefaultBilling = true;
        cartModel.billingAddress.stateCode = addressViewModel.stateName;
      } else cartModel.shippingAddress.isDefaultBilling = false;
    }
    //if address type is billing then save billing address in cart session
    else if (addressType === ADDRESS.BILLING_ADDRESS_TYPE || addressViewModel?.isDefaultBilling) {
      cartModel.billingAddress = addressViewModel;
      if (cartModel.billingAddress) cartModel.billingAddress.isDefaultBilling = true;
      if (cartModel.shippingAddress) cartModel.shippingAddress.isDefaultBilling = false;
      cartModel.billingAddress.stateCode = addressViewModel.stateName;

      addressViewModel.emailAddress = cartModel?.shippingAddress?.emailAddress;
      cartModel.billingAddress.emailAddress = cartModel?.shippingAddress?.emailAddress;
    }

    addressViewModel.hasError = false;
    addressViewModel.successMessage = ADDRESS.SUCCESS_ADDRESS_ADDED;
  }
  //Map AddressListViewModel with address and save in session.
  mapAddressListViewModel(addressViewModel, addressType);

  return { addressViewModel: addressViewModel, cartModel: cartModel };
}

export function setBillingShippingFlags(addressModel: IAddress, addressType?: string) {
  if (addressModel.isBothBillingShipping) {
    //Set default values
    if (addressType === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      addressModel.isDefaultShipping ? (addressModel.isDefaultBilling = true) : (addressModel.isDefaultBilling = false);
    } else if (addressType === ADDRESS.BILLING_ADDRESS_TYPE) {
      addressModel.isDefaultBilling ? (addressModel.isDefaultShipping = true) : (addressModel.isDefaultShipping = false);
    }
    addressModel.isShipping = true;
    addressModel.isBilling = true;
    addressModel.isShippingBillingDifferent = false;
  } else {
    addressModel.isShippingBillingDifferent = true;
    if (addressModel.isAddressBook && addressModel.isDefaultShipping && addressModel.isDefaultBilling) {
      addressModel.isShippingBillingDifferent = false;
    }
    if (addressType) {
      //Set address type and is default values
      addressModel.isShipping = addressType?.toLocaleLowerCase() === ADDRESS.SHIPPING_ADDRESS_TYPE.toLocaleLowerCase() ? true : false;
      addressModel.isBilling = addressType?.toLocaleLowerCase() === ADDRESS.BILLING_ADDRESS_TYPE.toLocaleLowerCase() ? true : false;
    }
  }
}

export async function createUpdateUserAddress(portalData: IPortalDetail, addressModel: IAddress, addressType: string, cartModel?: IShoppingCart) {
  try {
    if (addressType === ADDRESS.ADDRESS_BOOK_TYPE) {
      addressModel.isBilling = true;
      addressModel.isShipping = true;
      addressModel.isAddressBook = true;
      addressModel.isBothBillingShipping = true;
    }
    setBillingShippingFlags(addressModel, addressType);
    if (!addressModel?.userId || addressModel?.userId < 1) return await setAnonymousUserAddresses(portalData, addressModel, addressType, cartModel);
    const addressDetails = await createUpdateAddress(addressModel);
    return addressDetails;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {} as IAddress;
  }
}

export function setIsBillingShippingDifferentFlag(addressModel: IAddress) {
  if (addressModel.isBothBillingShipping) {
    addressModel.isBilling = true;
    addressModel.isShipping = true;
    addressModel.isShippingBillingDifferent = false;
  } else {
    addressModel.isShippingBillingDifferent = true;
    if (addressModel.isAddressBook && addressModel.isDefaultShipping && addressModel.isDefaultBilling) {
      addressModel.isShippingBillingDifferent = false;
    }
  }
}

export async function createUpdateAddress(addressModel: IAddress) {
  try {
    if (addressModel) {
      setIsBillingShippingDifferentFlag(addressModel);
      //Address Creation.
      if (addressModel.addressId === 0) {
        const webStoreAccountData = await WebStoreAccount_createAccountAddress(convertPascalCase(addressModel));
        const webStoreAccountResponse = convertCamelCase(webStoreAccountData);
        if (webStoreAccountResponse) {
          addressModel = webStoreAccountResponse.accountAddress;
          addressModel.hasError = webStoreAccountResponse?.hasError;
          if (!addressModel.hasError) addressModel.successMessage = ADDRESS.SUCCESS_ADDRESS_ADDED;
        } else return null;
      }
      //Address Update.
      else {
        const webStoreAccountData = await WebStoreAccount_updateAccountAddress(convertPascalCase(addressModel));
        const webStoreAccountResponse = convertCamelCase(webStoreAccountData);
        if (webStoreAccountResponse) {
          addressModel = webStoreAccountResponse.accountAddress;
          addressModel.hasError = webStoreAccountResponse?.hasError;
          if (!addressModel.hasError) addressModel.successMessage = ADDRESS.SUCCESS_ADDRESS_UPDATED;
        } else return null;
      }
      return addressModel;
    } else return null;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {} as IAddress;
  }
}

export async function getAddressList(addressId: number, otherAddressId: number) {
  try {
    if (!(addressId === null) && !(otherAddressId === null)) {
      const addressIds = [];
      addressIds.push(addressId);
      addressIds.push(otherAddressId);

      const filters: FilterCollection = new FilterCollection();
      filters.add(FilterKeys.AddressId, FilterOperators.In, addressIds.join("_"));
      const listModelData = await Address_getAddressList(undefined, convertPascalCase(filters.filterTupleArray), undefined, undefined, undefined);
      const listModelResponse = convertCamelCase(listModelData);

      const addressListModel: IAddressList = {
        addressList: listModelResponse?.addressList,
      };
      return addressListModel;
    }
  } catch (error) {
    logServer.error(AREA.ADDRESS, errorStack(error));
    return {} as IAddressList;
  }
}

export async function getAddressTableList(addressId: number, otherAddressId: number, loggedInUserAddressList: IAddressList, userAddressIds: (number | undefined)[]) {
  let addressList: IAddressList;
  //Get list from address table.
  const availableAddressList = await getAddressList(addressId, otherAddressId);

  if (loggedInUserAddressList?.addressList && availableAddressList && availableAddressList.addressList && loggedInUserAddressList?.addressList?.length > 0) {
    addressList = loggedInUserAddressList;
    //If  just inserted address are available in database then merge them to users address list.
    if (availableAddressList?.addressList?.some((addressInfo: IAddress) => !userAddressIds.includes(addressInfo.addressId)) ?? false) {
      const oneTimeAddress = availableAddressList.addressList.filter((availableAddressInfo: IAddress) => !userAddressIds.includes(availableAddressInfo.addressId));

      if (oneTimeAddress) {
        oneTimeAddress.forEach((address: IAddress) => (address.dontAddUpdateAddress = false));

        if (addressList.addressList) {
          addressList.addressList = addressList.addressList.concat(
            oneTimeAddress.filter((item) => {
              if (addressList.addressList) {
                !addressList.addressList.includes(item);
              }
            })
          );
        }
      }
    } else {
      //Address not available in address-book for the user, Set one time address flag.
      availableAddressList?.addressList?.forEach((value: IAddress) => (value.dontAddUpdateAddress = false));
      //Logged in user has no address mapped to himself.
      addressList = availableAddressList;
    }
    return addressList;
  }
}

export async function getAddressListForUser(addressId: number, otherAddressId: number, cartModel?: IShoppingCart) {
  try {
    //Get Logged in user Address list
    const loggedInUserAddressList = await getAddressListData(0, false, cartModel);

    //Set Address book availability flag
    loggedInUserAddressList?.addressList?.forEach((o: { dontAddUpdateAddress: boolean }) => {
      o.dontAddUpdateAddress = true;
    });

    const userAddressIds: (number | undefined)[] = [];
    loggedInUserAddressList?.addressList
      ? // eslint-disable-next-line array-callback-return
        loggedInUserAddressList.addressList.map((item: any) => {
          if (item.addressId) {
            userAddressIds.push(item.addressId);
          }
        })
      : [];

    let addressList: IAddressList | undefined;
    //Get recently added address list (For one time use address)
    //Check if recently added address list is available in users associated address,
    // If not then get it from address table and merge to users associated address
    if (userAddressIds && userAddressIds.includes(addressId) && userAddressIds.includes(otherAddressId)) {
      //Newly inserted address and previously inserted address is mapped to users address list
      addressList = loggedInUserAddressList;
    } else {
      addressList = await getAddressTableList(addressId, otherAddressId, loggedInUserAddressList, userAddressIds);
      return addressList;
    }
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return {} as IAddressList;
  }
}

export async function setBillingShippingAddress(addressId: number, otherAddressId: number, userId: number, type: string, addressResponse?: any) {
  const addressList = await getAddressListForUser(addressId, otherAddressId, addressResponse);

  if (addressList?.addressList && addressList?.addressList?.length > 0) {
    const sortedSelectedAddress = addressList.addressList.find((info) => info.addressId === addressId);

    let selectedAddress: IAddress = {};
    if (sortedSelectedAddress) selectedAddress = sortedSelectedAddress;

    const otherAddress = addressList.addressList.find((otherInfo) => otherInfo.addressId === otherAddressId);

    if (type === ADDRESS.BILLING_ADDRESS_TYPE && selectedAddress) {
      addressList.billingAddress = selectedAddress;
      addressList.shippingAddress = selectedAddress && selectedAddress["isShipping"] ? selectedAddress : otherAddress ?? addressList.shippingAddress;
    } else if (type === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      addressList.shippingAddress = selectedAddress;
      addressList.billingAddress = selectedAddress && selectedAddress.isBilling ? selectedAddress : otherAddress ?? addressList.billingAddress;
    }
  }
}

/**
 * Updates the user address and manages billing/shipping address associations.
 * @param portalDetails - Portal details.
 * @param addressModel - Address model to update.
 * @param hasFormChanged - Whether the form has changed.
 * @param addressType - Type of address (Billing/Shipping).
 * @param cartModel - Cart data if available.
 * @returns The updated address response.
 */

export async function updateAddress(portalDetails: IPortalDetail, addressModel: IAddress, hasFormChanged: boolean, addressType: string, cartModel?: IShoppingCart) {
  try {
    if (addressModel) {
      if (hasFormChanged) {
        let allAddresses: IAddressList = {
          addressList: [],
        };
        if (!addressModel.userId) {
          if (addressType) {
            addressModel.isDefaultShipping = addressType === ADDRESS.SHIPPING_ADDRESS_TYPE;
            addressModel.isDefaultBilling = addressType === ADDRESS.BILLING_ADDRESS_TYPE;
            addressModel.useSameAsShippingAddress = addressModel.isBothBillingShipping;
          }
        } else {
          allAddresses = await getAddressListData(0, false, cartModel);

          if (Object.is(allAddresses?.addressList, null) || (allAddresses.addressList && allAddresses.addressList.length < 1)) {
            if (addressType) {
              addressModel.isDefaultShipping = addressType === ADDRESS.SHIPPING_ADDRESS_TYPE;
              addressModel.isDefaultBilling = addressType === ADDRESS.BILLING_ADDRESS_TYPE;
            } else {
              addressModel.isDefaultShipping = true;
              addressModel.isDefaultBilling = true;
            }
          }
        }
        if (addressType?.toLowerCase() === ADDRESS.BILLING_ADDRESS_TYPE && allAddresses.shippingAddress) {
          addressModel.otherAddressId = allAddresses.shippingAddress.addressId;
        } else if (addressType?.toLowerCase() === ADDRESS.SHIPPING_ADDRESS_TYPE) {
          addressModel.otherAddressId = allAddresses?.billingAddress?.addressId ?? 0;
        }

        const addressResponseData: any = await createUpdateUserAddress(portalDetails, addressModel, addressType, cartModel);
        let addressResponse;
        let cartModelResponseData;

        if (addressResponseData?.addressViewModel) {
          addressResponse = addressResponseData?.addressViewModel;
          cartModelResponseData = addressResponseData?.cartModel;
        } else {
          addressResponse = addressResponseData;
        }

        if (addressResponse) {
          if (addressResponse.errorMessage) {
            return getUpdateAddressResponse(addressResponse, true, addressResponse.errorMessage, addressType, addressResponse.successMessage ?? "");
          }

          //Set New billing shipping address
          if (addressResponse?.addressId && addressResponse?.addressId > 0 && addressModel.otherAddressId && addressResponse.userId) {
            await setBillingShippingAddress(addressResponse.addressId, addressModel.otherAddressId, addressResponse.userId, addressType, addressResponse);
          }

          return getUpdateAddressResponse(
            addressResponse,
            !addressResponse.hasError,
            addressResponse.errorMessage ?? "",
            addressType,
            addressResponse.successMessage ?? "",
            cartModelResponseData
          );
        }
      } else {
        //Set New billing shipping address
        if (addressModel.addressId && addressModel.otherAddressId && addressModel.userId)
          await setBillingShippingAddress(addressModel.addressId, addressModel.otherAddressId, addressModel.userId, addressType);

        return getUpdateAddressResponse(addressModel, false, "", addressType, addressModel.successMessage ?? "");
      }
    }
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return {} as IUpdateAddressResponse;
  }
}
