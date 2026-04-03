/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAddress } from "@znode/types/address";
import { IAnonymousUserAddressRequest, IAnonymousUserAddressResponse, ICustomerAccountList, ILoginUser, IUserAccountListResponse, IUserRequestDetail } from "@znode/types/user";
import { httpRequest } from "../base";
import { IAccountUserResponse } from "@znode/types/account";

export const createAnonymousUserAccount = async (billingAddress: IAddress, shippingEmailAddress: string, baseUrl: string) => {
  const accountResponse = await httpRequest<any>({
    endpoint: "/api/create-anonymous-user-account",
    method: "POST",
    body: { billingAddress, shippingEmailAddress, baseUrl },
  });

  return accountResponse;
};

export const createAnonymousUserAddressId = async (addressRequest: IAnonymousUserAddressRequest) => {
  const addressIdResponse = await httpRequest<IAnonymousUserAddressResponse>({
    endpoint: "/api/create-anonymous-user-addressId",
    method: "POST",
    body: { addressRequest },
  });
  return addressIdResponse;
};

export const enableDisableAccount = async (props: { userId: number; accountId: number; isLock: boolean }) => {
  const response = await httpRequest<{ hasError: boolean; isSuccess: boolean; message: string }>({
    endpoint: "/api/account/account-users/enable-disable",
    method: "PUT",
    body: props,
  });
  return response;
};

export const accountUserResetPassword = async (props: { userName?: string; baseUrl?: string; email?: string }) => {
  const response = await httpRequest<{ passwordData: { hasError: boolean } }>({ endpoint: "/api/account/account-users/reset-password", body: props });
  return response.passwordData;
};

export const getCustomerAccountList = async (props: ICustomerAccountList) => {
  const { sortValue, pageIndex, pageSize, currentFilters, accountId, userId, userName } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&currentUserName=${userName}&AccountId=${accountId}&UserId=${userId}&pageIndex=${pageIndex}&pageSize=${pageSize}&currentFilters=${JSON.stringify(
    currentFilters
  )}`;

  const queryString = `${sortQueryString}`;
  const response = await httpRequest<IAccountUserResponse>({ endpoint: `/api/account/account-users?${queryString}` });
  return response;
};

export const getUserAccountList = async ({ accountCode, pageNumber, pageSize, searchTerm }: { accountCode: string; pageNumber: number; pageSize: number; searchTerm: string }) => {
  const response = await httpRequest<IUserAccountListResponse>({ endpoint: "/api/user/account-list", queryParams: { accountCode, pageNumber, pageSize, searchTerm } });
  return response;
};

export const userLogin = async (props: IUserRequestDetail) => {
  const response = await httpRequest<ILoginUser>({ endpoint: "/api/user/login", method: "POST", body: props });
  return response;
};
