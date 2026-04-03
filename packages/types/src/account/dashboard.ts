import { IAddress } from "../address";

export interface IDashboardRequest {
  isAddressBook: boolean;
}

export interface IDashboardDetailData {
  dashboardShippingAddress: IAddress | undefined;
  dashboardBillingAddress: IAddress | undefined;
}

export interface IDashboardFields {
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}
