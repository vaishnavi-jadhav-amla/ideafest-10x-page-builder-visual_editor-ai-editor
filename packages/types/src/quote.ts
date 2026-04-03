import { IBase } from "./base";
import { QUOTE_STATUS } from "@znode/constants/quote";

export interface IQuoteList {
  totalResults: number;
  pageSize: number;
  pageIndex: number;
  quoteList: {
    quotes: IQuote[];
    portalName: string;
  };
}
export interface IQuoteModel {
  expirationDate?: string;
  statusCode?: string;
  classStateName?: (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];
}

export interface IQuote extends IBase {
  portalId: number;
  userId: number;
  userName: string;
  storeName: string;
  modifiedDate: Date;
  email: string;
  quoteExpirationDate: Date;
  customerName: string;
  quoteDate: string;
  omsQuoteId: number;
  quoteStatus: string;
  quoteNumber: string;
  totalAmount: number;
  currencyCode?: string;
  [key: string]: unknown;
}

export interface IQuoteProductList {
  productName: string;
}
