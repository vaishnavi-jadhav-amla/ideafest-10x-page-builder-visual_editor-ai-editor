import { httpRequest } from "../base";

export const updateBillingAddressId = async (billingAddressId: number) => {
  const addressList = await httpRequest<boolean>({ endpoint: "/api/checkout-address/update-billing-addressId", body: { billingAddressId } });
  return addressList;
};
