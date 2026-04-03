import { IAddress, IAddressList } from "@znode/types/address";
import { httpRequest } from "../base";

export const getRecommendedAddressForUser = async (userEnteredAddress: IAddress) => {
  const addressList = await httpRequest<IAddressList>({ endpoint: "/api/checkout-address/get-recommended-address", body: { userEnteredAddress } });
  return addressList;
};
