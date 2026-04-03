import { ICountry } from "../common";

export interface IAccountResponse {
  accountData?: IAccountInformation | null;
  addressDetails?: IAccountAddress | null;
  countryList?: ICountry[];
}

export interface IAccountInformation {
  accountId: number;
  externalId: string;
  name: string;
  phoneNumber: number;
}
export interface IAccountAddress {
  addressId?: number;
  externalId: string;
  accountName: string;
  displayName: string;
  address1: string;
  address2: string;
  postalCode: string;
  cityName: string;
  countryName: string;
  stateName: string;
  phoneNumber: number;
  accountId?: string;
  accountPhoneNumber?: string;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
}

export interface IAccountUserInformation {
  roleName: string;
  accountId: number;
}
