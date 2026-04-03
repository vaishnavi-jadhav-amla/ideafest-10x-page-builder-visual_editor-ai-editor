import { IAddAddressRequest, IAddress, IAddressList, IEditAddressRequest, ISaveCheckout } from "@znode/types/address";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { IShoppingCart } from "@znode/types/shopping";
import { httpRequest } from "../base";
import { objectToQueryString } from "@znode/utils/component";

//TODO: Not in use need to check is it use in checkout-helper or not
export const getCalculatedShippingDetails = async (
  shippingAddressId: number,
  shippingOptionId?: number,
  shippingCode?: number | string,
  additionalInstruction?: string,
  isCalculateCart?: boolean,
  formattedCartData?: string,
  billingAddressId?: string | number
) => {
  const requestBody = {
    shippingAddressId: shippingAddressId,
    shippingOptionId: shippingOptionId,
    shippingCode: shippingCode,
    additionalInstruction: additionalInstruction,
    isCalculateCart: isCalculateCart,
    formattedCartData: formattedCartData,
    billingAddressId: billingAddressId,
  };

  const shippingDetails = await httpRequest<any>({
    endpoint: "/api/address/getList",
    body: requestBody,
  });
  return shippingDetails;
};

export const updateAddressIds = async (shippingAddressId: number, billingAddressId: number, shippingOptionId: number | null) => {
  const orderReceiptData = await httpRequest<boolean>({
    endpoint: "/api/checkout-address/update-addressIds",
    body: { shippingAddressId, billingAddressId, shippingOptionId },
  });
  return orderReceiptData;
};

export const getAddressDetailsById = async (addressId: number) => {
  const queryString: string = objectToQueryString({ addressId: addressId });

  const orderReceiptData = await httpRequest<IAddress>({ endpoint: `/api/checkout-address/get-address-by-id?${queryString}` });
  return orderReceiptData;
};

export const getUserAddressDetailsByEditModal = async (props: IEditAddressRequest, cartModel: IShoppingCart) => {
  const editRequestModel = props;
  const addressList = await httpRequest<IAddress>({ endpoint: "/api/checkout-address/update-edit-user-address", body: { editRequestModel, cartModel } });
  return addressList;
};

export const getUserAddressDetails = async (props: IAddAddressRequest, cartModel: IShoppingCart) => {
  const editRequestModel = props;
  const addressList = await httpRequest<IAddressList>({ endpoint: "/api/checkout-address/address-list", body: { editRequestModel, cartModel } });
  return addressList;
};

export const saveCheckoutAddressForUser = async (addressModel: IAddress, isFormChange: boolean, addressType: string, cartModel?: IShoppingCart) => {
  const orderReceiptData = await httpRequest<ISaveCheckout>({
    endpoint: "/api/checkout-address/save-checkout-address",
    body: { addressModel, isFormChange, addressType, cartModel },
  });
  return orderReceiptData;
};
