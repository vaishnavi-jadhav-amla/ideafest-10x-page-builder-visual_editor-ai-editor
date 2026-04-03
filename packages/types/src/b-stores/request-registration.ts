export interface IBStoresRequestRegistrationModel {
  bStoreRegistrationId?: number;
  address: string;
  addressLine1: string;
  addressLine2?: string;
  firstName: string;
  lastName: string;
  countryName: string;
  stateName: string;
  cityName: string;
  stateCode: string;
  postalCode: string;
  phoneNumber: string;
  userId: number;
  emailAddress: string;
  companyName?: string;
  countryCode: string;
  portalId: number;
  localeId?: number;
}

export interface IBooleanModel {
  isSuccess?: boolean;
  errorMessage?: string;
  hasError?: boolean;
  successMessage?: string;
}

export interface IBStoresRequestRegistrationResponse {
  errorCode?: number;
  errorMessage?: string;
  hasError?: boolean;
  booleanModel?: IBooleanModel;
  isSuccess?: boolean;
}
