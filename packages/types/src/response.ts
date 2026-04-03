export interface ITrueFalseResponse extends IBaseResponse {
  isSuccess: boolean;
}

export interface IBaseResponse {
  errorCode: number;
  hasError: boolean;
  errorMessage: string;
}
