import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Account_getAccount, Account_updateAccountAddress } from "@znode/clients/v1";
import { IAccountAddress, IAccountResponse, IAccountUserInformation } from "@znode/types/account";

import { ACCOUNT } from "@znode/constants/account";
import { ICountry } from "@znode/types/common";
import { convertPascalCase } from "@znode/utils/server";
import { getCountries } from "../../common/common";

//Get Account Information
export async function getAccountInformation(userDetails: IAccountUserInformation, portalId: number): Promise<IAccountResponse> {
  try {
    if (userDetails.accountId && userDetails.roleName) {
      const accountDetails = await Account_getAccount(userDetails?.accountId);
      const accountDetailsResponse: IAccountResponse = {};
      if (accountDetails && accountDetails.Account) {
        accountDetailsResponse.accountData = {
          accountId: accountDetails.Account.AccountId as number,
          externalId: accountDetails.Account?.ExternalId as string,
          name: accountDetails.Account.Name as string,
          phoneNumber: Number(accountDetails.Account.Address?.PhoneNumber),
        };

        if (accountDetails.Account.Address) {
          const {
            AddressId,
            ExternalId,
            AccountName,
            DisplayName,
            Address1,
            Address2,
            PostalCode,
            CityName,
            CountryName,
            StateName,
            PhoneNumber,
            IsDefaultBilling,
            IsDefaultShipping,
          } = accountDetails.Account.Address;
          accountDetailsResponse.addressDetails = {
            addressId: AddressId as number,
            externalId: ExternalId ?? "",
            accountName: AccountName,
            displayName: DisplayName as string,
            address1: Address1 as string,
            address2: Address2 as string,
            postalCode: PostalCode ?? "",
            cityName: CityName as string,
            countryName: CountryName as string,
            stateName: StateName as string,
            phoneNumber: PhoneNumber ? Number(PhoneNumber) : 0,
            isDefaultBilling: IsDefaultBilling as boolean,
            isDefaultShipping: IsDefaultShipping as boolean,
          };
        }
        accountDetailsResponse.countryList = (await getCountriesData(userDetails.roleName, portalId)) as ICountry[];
        return accountDetailsResponse;
      }
    }
    return {
      accountData: null,
      addressDetails: null,
      countryList: [],
    };
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return {
      accountData: null,
      addressDetails: null,
      countryList: [],
    };
  }
}
export async function getCountriesData(roleName: string, portalId: number) {
  // If role name is administrator, bind country list to dropdown to update account info.
  if (roleName.toLocaleLowerCase() === ACCOUNT.ADMINISTRATOR_ROLE_NAME.toLocaleLowerCase()) {
    const countryList = await getCountries(portalId);
    return countryList;
  }
}

//Update account information.
export async function updateAccountInformationAddress(addressData: IAccountAddress): Promise<boolean> {
  try {
    const updatedAddress = await Account_updateAccountAddress(convertPascalCase(addressData));
    if (updatedAddress && updatedAddress.AccountAddress && updatedAddress.AccountAddress.AddressId && updatedAddress.AccountAddress.AddressId > 0) {
      return true;
    }
    return false;
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return false;
  }
}
