export interface IDateFormat {
  isDefault: boolean;
  dateFormat: string;
}

export interface ITimeZone {
  isDefault: boolean;
  timeZoneDetailsDesc: string;
}

export interface ITimeFormat {
  isDefault: boolean;
  timeFormat: string;
}

export interface IGeneralSetting {
  displayTimeZone: string;
  dateFormat: string;
  timeFormat: string;
  priceRoundOff?: number;
  userActivityEnabled?: boolean;
}
