export interface IAccountUserResponse {
  hasError?: boolean;
  users: IAccountUser[];
  pageIndex: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}
export interface IAccountUser {
  userId: number;
  userName: string;
  roleId: number;
  roleName: string;
  lastName: string;
  firstName: string;
  fullName: string;
  accountId: number;
  email: string;
  isLock: boolean;
}

export interface IAccountUserSearchByKey {
  key: string;
  value: string;
  type: string;
  columns: { status: string; date: string };
}
export interface IAccountSort {
  [key: string]: string;
}

export interface IAccountEnableDisabled {
  isSuccess: boolean;
  hasError: boolean;
  message?: string;
}

export interface IUserProfileRequestModel {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
}
