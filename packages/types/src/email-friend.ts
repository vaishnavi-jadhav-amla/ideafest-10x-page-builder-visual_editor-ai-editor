export interface IEmailFriendResponse {
  isSuccess?: boolean;
  errorCode?: number;
  errorMessage?: string;
  hasError?: boolean;
  statusCode?: number;
}

export interface IEmailAFriendRequest {
  yourMailId: string;
  friendMailId: string;
  localeCode: string | undefined;
  catalogCode: string;
  storeCode: string;
  productName: string;
  productUrl: string;
}
