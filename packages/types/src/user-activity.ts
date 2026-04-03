import { IUser } from "./user";

export interface IUserActivityParams {
  eventName: string;
  userDetails: {
    userId?: number | null;
    userName?: string | null;
    accountId?: number | null;
    accountCode?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    roleName?: string | null;
  };
  storeCode: string;
  localeCode: string;
  ua: string;
  referrerURL?: string | null;
  ip: string;
  activityError?: string;
  activityStatus?: string;
  orderId?: string;
  orderTotal?: number;
  currency?: string;
  loginTimestamp: string;
}

interface IBaseUserActivity {
  eventName: string;
  applicationType?: string;
  storeCode?: string;
  eventDateTime?: string;
  userId?: number | null;
  userName?: string | null;
  accountId?: number | null;
  accountCode?: string | null;
  roleName?: string | null;
  ipAddress?: string;
  device?: string;
  browser?: string;
  entityType?: string;
}

export interface ILoginEvent extends IBaseUserActivity {
  details?: string;
  activityStatus?: string;
  referrerURL?: string | null;
  ipAddress?: string;
}

export interface ILoginFailedEvent extends IBaseUserActivity {
  activityError?: string;
  userData?: IUser;
  referrerURL?: string | null;
  activityStatus?: string;
  ipAddress?: string;
}

export interface ILogoutEvent extends IBaseUserActivity {
  userData?: IUser;
  loginTimestamp?: string;
  entityType?: string;
  details?: string;
  activityStatus?: string;
  referrerURL?: string | null;
  ipAddress?: string;
}

export interface IPasswordEvents extends IBaseUserActivity {
  activityStatus?: string;
  activityError?: string;
  userData?: IUser;
  referrerURL?: string | null;
  ipAddress?: string;
}

export interface IOrderPlacedEvent extends IBaseUserActivity {
  userData?: IUser;
  entityId?: string;
  orderId?: string;
  orderTotal: number;
  currency?: string;
  details?: string;
  activityStatus?: string;
  referrerURL?: string | null;
  ipAddress?: string;
}

export type IUserActivityLog = ILoginEvent | ILogoutEvent | ILoginFailedEvent | IPasswordEvents | IOrderPlacedEvent;
