import { FilterTuple, UserListResponse } from "@znode/clients/v1";
import { BooleanResponse, Users_accountStatus, Users_forgotPassword, Users_userAccountsByLoggedUserAccountId } from "@znode/clients/v2";
import { ACCOUNT } from "@znode/constants/account";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IAccountEnableDisabled, IAccountUser, IAccountUserResponse, IAccountUserSearchByKey } from "@znode/types/account";
import { IFilterTuple } from "@znode/types/filter";

import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators } from "@znode/utils/server";

//Get Customer Account List.
export async function getCustomerAccountList(
  accountId: number,
  userId: number,
  pageSize?: number,
  pageIndex?: number,
  sortValue?: { [key: string]: string },
  searchByKey?: IAccountUserSearchByKey[]
): Promise<IAccountUserResponse> {
  try {
    const filters: IFilterTuple[] = await getAccountFilters(accountId, true, searchByKey);
    const customerDetailsResponse: UserListResponse = await Users_userAccountsByLoggedUserAccountId(userId, filters as FilterTuple[], sortValue, pageIndex, pageSize);
    const customerDetails: { users: IAccountUser[]; paginationDetail: IAccountUserResponse } = convertCamelCase(customerDetailsResponse);
    const accountUserListResponse: IAccountUserResponse = {
      users: [],
      pageIndex: 1,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    };

    if (customerDetails && customerDetails.users && customerDetails.users.length > 0) {
      const { pageIndex, pageSize, totalPages, totalResults } = customerDetails.paginationDetail;
      const userListData = customerDetails.users.map((item) => {
        return {
          userId: item.userId,
          userName: item.userName,
          roleId: Number(item.roleId),
          roleName: item.roleName,
          lastName: item.lastName,
          firstName: item.firstName,
          fullName: item.fullName,
          accountId: item.accountId,
          email: item.email,
          isLock: item.isLock,
        };
      });
      return {
        users: userListData,
        pageIndex,
        pageSize,
        totalPages,
        totalResults,
      };
    }
    return accountUserListResponse;
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return {
      users: [],
      pageIndex: 0,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    };
  }
}
export async function getAccountFilters(accountId: number, isAccountCustomer?: boolean, searchBy?: IAccountUserSearchByKey[]) {
  const filters: FilterCollection = new FilterCollection();
  if (accountId !== undefined && accountId > 0) filters.add(FilterKeys.AccountId, FilterOperators.Equals, accountId.toString());
  if (isAccountCustomer) filters.add(FilterKeys.IsAccountCustomer, FilterOperators.Equals, isAccountCustomer.toString());
  if (searchBy && searchBy.length > 0) {
    searchBy.forEach((val) => {
      filters.add(val?.type !== "date" ? val?.columns?.status : val?.columns?.date, String(val?.key), val?.value);
    });
  }
  return filters.filterTupleArray;
}

//Enable disable customer account.
export async function accountEnableDisable(userId: number, isLock: boolean, loggedInUserId: number): Promise<IAccountEnableDisabled> {
  try {
    if (loggedInUserId === userId) {
      return {
        isSuccess: false,
        hasError: true,
        message: ACCOUNT.ERROR_DISABLE_LOGGER_IN_USER,
      };
    }
    const enableDisabledAccountData: BooleanResponse = await Users_accountStatus(userId, {
      Enabled: isLock,
    });
    return {
      isSuccess: enableDisabledAccountData.IsSuccess as boolean,
      hasError: !enableDisabledAccountData.IsSuccess,
    };
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return { isSuccess: false, hasError: true, message: "Account enable/disable failed" };
  }
}

export async function accountUserResetPassword(userName: string, baseUrl: string, storeCode: string) {
  try {
    const userModel = {
      UserName: userName,
      StoreCode: storeCode,
      BaseUrl: baseUrl,
    };
    const { HasError } = await Users_forgotPassword(userModel);
    return {
      hasError: HasError,
    };
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return { isSuccess: false, hasError: true, message: "Something went wrong!" };
  }
}
