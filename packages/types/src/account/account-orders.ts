import { IOrder } from "./order";

export interface IAccountOrdersList {
  totalResults: number;
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  orderList: IOrder[];
}
export interface IAccountData {
  accountId: number;
  externalId: string;
  name: string;
  phoneNumber: string | null;
}
