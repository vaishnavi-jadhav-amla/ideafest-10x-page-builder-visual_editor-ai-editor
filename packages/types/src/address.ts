import { IBase } from "./base";

export interface IAddress {
  publishStateId?: number;
  successMessage?: string;
  errorMessage?: string;
  useSameAsShippingAddress?: boolean;
  dashboardBillingAddress?: IAddress;
  dashboardShippingAddress?: IAddress;
  addressId?: number;
  accountId?: number;
  address1?: string;
  address2?: string;
  address3?: string | null;
  displayName?: string | null;
  firstName?: string;
  hasError?: boolean;
  lastName?: string;
  countryName?: string;
  stateName?: string;
  cityName?: string;
  stateCode?: string;
  postalCode?: string;
  phoneNumber?: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  isActive?: boolean;
  isGuest?: boolean;
  isShipping?: boolean;
  isBilling?: boolean;
  isShippingBillingDifferent?: boolean;
  fromBillingShipping?: string | null;
  accountAddressId?: number;
  warehouseId?: number;
  userId?: number;
  userAddressId?: number;
  mobileNumber?: string | null;
  alternateMobileNumber?: string | null;
  faxNumber?: string | null;
  warehouseName?: string | null;
  emailAddress?: string;
  isUseWareHouseAddress?: boolean | null;
  isBothBillingShipping?: boolean;
  portalId?: number;
  companyName?: string;
  countryCode?: string | null;
  isAddressBook?: boolean;
  shippingAddress?: IAddress;
  billingAddress?: IAddress;
  createdBy?: number;
  modifiedBy?: number;
  actionMode?: string | null;
  countries?: ICountryList[];
  custom1?: string | null;
  custom2?: string | null;
  custom3?: string | null;
  custom4?: string | null;
  custom5?: string | null;
  addressType?: string;
  dontAddUpdateAddress?: boolean;
  otherAddressId?: number;
  shippingAddressId?: number;
  billingAddressId?: number;
  street?: string;
  state?: string;
  zipCode?: string;
  isCommercial?: boolean;
}

export interface IAddressList extends IBase {
  userId?: number;
  accountId?: number;
  addressList: IAddress[];
  shippingAddress?: IAddress;
  billingAddress?: IAddress;
  selectedAddressId?: number;
  isGuestUser?: boolean;
  hideAddressButton?: boolean;
}

export interface IAddressDetailsRequest {
  userId: string;
  isCartAddress: boolean;
  type: string;
  addressId: string;
  otherAddressId?: string;
  isFromEdit: boolean;
}

export interface IAllAddressList {
  addressList: IAddress[];
  fetchUpdatedAddressData: () => void;
  disableAddressButton?: boolean;
}

export interface IDisplayAddress {
  userAddress: IAddress;
  addressType?: string;
  shippingConstraint?: string;
  showShippingConstraint?: boolean;
  inHandDate?: string;
  shippingType?: string;
}

export interface IDeleteAccountAddress {
  ids: string;
  portalId: number;
}

export interface IAddressData {
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  hasError?: boolean;
  addressData: IAddressList | undefined;
  disableAddressButton: boolean;
}

export interface ICountryList {
  countryName: string;
  countryId: number;
  countryCode: string;
  isDefault: boolean;
}

export interface ICartAddressModel {
  billingEmail: string;
  shippingAddress: IAddress;
  billingAddress: IAddress;
  productId?: number;
  productName?: string;
  sKU?: string;
  quantity?: string;
  productType?: string;
  parentProductId?: number;
}

export interface IShippingConstraints {
  description?: string;
  isSelected?: boolean;
  shippingConstraintCode?: string;
}

export interface IEditAddressRequest {
  addressId: number;
  otherAddressId: number;
  type: string;
  isFromEdit: boolean;
  isGuestUser?: boolean;
}

export interface IAddAddressRequest {
  type: string;
  addressListCount?: number;
  isGuestUser?: boolean;
  userId?: number;
  accountId?: number;
  hasDefaultBillingAddress?: boolean;
  hasDefaultShippingAddress?: boolean;
}

export interface IAddressFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  isCommercial:string |boolean;
  phoneNumber: string;
  companyName: string;
  address1: string;
  address2: string;
  postalCode: string;
  cityName: string;
  isDefaultShipping?: boolean | false;
  isDefaultBilling?: boolean | false;
  emailAddress?: string;
  dontAddUpdateAddress?: boolean;
  isBothBillingShipping?: boolean;
}

export interface ICountries {
  countryName?: string;
  countryId?: number;
  countryCode?: string;
  isDefault?: boolean;
}

export interface IState {
  stateName?: string;
  stateCode?: string;
  stateId?: number;
}

export interface IAddressFormSortedFields {
  displayName?: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  companyName?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  cityName?: string;
}

export interface IAddressFieldProps {
  label?: string;
  name: string;
  value?:string;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any[];
  onChange?: (_e: React.ChangeEvent<HTMLSelectElement>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  maxLength?: number;
  checked?: boolean;
  disabled?: boolean;
  lengthErrorMessage?: string;
  requiredErrorMessage?: string;
  customError?: string;
  pattern?: { value: RegExp; message: string };
  defaultValue?: string | number | boolean;
  type?: string;
}

export interface IAddressDetails {
  addressId?: number;
  firstName?: string;
  lastName?: string;
  cityName?: string;
  stateName?: string;
  stateCode?: number;
  postalCode?: string;
  companyName?: string;
  phoneNumber?: string;
  countryName?: string;
  address1?: string;
  address2?: string;
  isBilling: boolean;
  isShipping: boolean;
  displayName?: string;
}

export interface ISaveCheckout {
  addressModel: IAddress;
  addressType: string;
  error: string;
  status: boolean;
  successMessage: string;
}
