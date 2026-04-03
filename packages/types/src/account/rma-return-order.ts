export interface IReturnHistoryResponse {
  returnList: IReturnHistoryList[];
  totalResults: number;
}

export interface IReturnHistoryList {
  returnNumber: string;
  returnDate: Date;
  returnStatus: string;
  returnName: string;
  linkedClassNumber: string;
  totalExpectedReturnQuantity: number;
}
