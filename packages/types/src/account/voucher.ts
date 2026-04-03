export interface IVoucher {
  GiftCardId?: number;
  PortalId?: number;
  Name?: string;
  CardNumber?: string;
  Amount?: number;
  UserId?: number;
  ExpirationDate?: Date;
  IsReferralCommission?: boolean;
  RemainingAmount?: number;
  StartDate?: Date;
  IsActive?: boolean;
  RestrictToCustomerAccount?: boolean;
}
export interface IVoucherResponse {
  totalResults: number;
  totalPages: number;
  pageSize: number;
  pageIndex: number;
  voucherHistoryList: IVouchers[];
  message?: string;
  voucherCard?: IVoucherCard;
}

export interface IVouchers {
  giftCardId?: number;
  startDate: string;
  amount: number;
  name: string;
  cardNumber?: string;
  expirationDate?: string;
  remainingAmount?: number;
  currencyCode?:string;
  currentDate?: string;
}

export interface IVoucherCard {
  name: string;
  cardNumber: number;
  expirationDate?: string;
  remainingAmount?: number;
  startDate?:  string;
  currencyCode?: string;
  originalAmount?: number;
}

export interface IVoucherList {
  orderNumber:number;
  transactionDate:string;
  notes: string;
  transactionAmount: number;
  omsOrderId: number;
}

export interface IVoucherDetailsResponse {
  totalResults: number;
  totalPages: number;
  pageSize: number;
  pageIndex: number;
  voucherHistoryList: IVoucherList[];
  voucherCard: IVoucherCard | null;
}
