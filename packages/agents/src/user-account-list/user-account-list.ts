import { Account_list, Users_usersByUsername } from "@znode/clients/v2";
import { COMMON } from "@znode/constants/common";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, convertPascalCase, FilterCollection, FilterKeys, FilterOperators, getPortalHeader } from "@znode/utils/server";

export async function getUserAccountList(parentAccountCode: string, pageNumber: number, pageSize: number, searchTerm: string) {
  try {
    const { portalId } = (await getPortalHeader()) || {};
    const filters: FilterCollection = new FilterCollection();
    if (portalId) filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
    if (searchTerm) filters.add(FilterKeys.Name, FilterOperators.Contains, searchTerm);

    const sort: { [key: string]: string } = { Name: COMMON.ASC };
    const response = convertCamelCase(await Account_list(parentAccountCode, convertPascalCase(filters.filterTupleArray), pageNumber, pageSize, sort));
    if (!response?.hasError && Array.isArray(response?.accountList)) return { accountList: response?.accountList, totalResults: response?.paginationDetail?.totalResults };
    else return { accountList: [], totalResults: 0 };
  } catch (error) {
    logServer.error(AREA.ACCOUNT, `Failed to get user account list: ${errorStack(error)}`);
    return { accountList: [], totalResults: 0 };
  }
}

export async function getUserDetailsByAccount(userName: string, accountId: number) {
  try {
    const { storeCode = "" } = (await getPortalHeader()) || {};
    const userData = await Users_usersByUsername(userName || "", storeCode, accountId);
    return convertCamelCase(userData);
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return null;
  }
}
