import { IProfile } from "./user";

export interface ISingleSigninRequest {
  token: string;
  domainName: string;
}

export interface IUserLoginResponse {
  userId: number;
  accountId: number;
  accountCode: string;
  aspNetUserId: string;
  firstName: string;
  lastName: string;
  roleName: string;
  phoneNumber: string | null;
  email: string;
  isActive: boolean;
  externalId: string | null;
  userName: string;
  isVerified: boolean;
  emailOptIn: boolean;
  smsOptIn: boolean;
  customerPaymentGuid: string | null;
  perOrderLimit: number;
  annualOrderLimit: number;
  annualBalanceOrderAmount: number;
  publishCatalogId: number | null;
  catalogCode: string | null;
  profiles: IProfile[];
  custom1: string | null;
  custom2: string | null;
  custom3: string | null;
  custom4: string | null;
  custom5: string | null;
}

export interface ILoginRequest {
  username: string;
  password?: string;
  storeCode?: string;
  domainName?: string;
  singleSignIn?: string;
  impersonation?: string;
}
