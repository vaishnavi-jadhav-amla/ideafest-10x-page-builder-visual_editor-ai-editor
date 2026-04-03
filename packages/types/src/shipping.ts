import { IGeneralSetting } from "./general-setting";

export interface ISaveShippingDetails {
  shippingId: number;
  inHandDate?: Date;
  shippingConstraintCode?: string;
  isShipCompletely?: boolean;
  shippingAddressId?: number;
  cartNumber?: string;
}

export interface IShippingEstimatorDetails {
  zipCode: string;
}
export interface IShippingRequest {
  shippingCountryCode?: string;
  shippingStateCode?: string;
  shippingPostalCode?: string;
  cartNumber?: string;
  isShippingEstimator?: boolean;
  shippingAddressId: number;
  billingAddressId: number;
  userId?: number;
}

export interface IShippingOption {
  shippingName?: string;
  shippingRate?: number;
  handlingCharge?: number;
  shippingCode?: string;
  shippingId?: number;
  description?: string;
  estimateDate?: string;
  shippingRateWithoutDiscount?: number;
  isActive?: boolean;
  isSelected?: boolean;
  shippingDiscount?: number;
}

export interface IShippingConstraint {
  shippingConstraintCode: string;
  description: string;
}

export interface IShippingConstraintProps {
  onShippingConstraintChange: (_shippingConstraintCode: string) => void;
  onInHandDateChange: (_inHandDate: string) => void;
  generalSetting: IGeneralSetting;
  currentDate: string;
}
