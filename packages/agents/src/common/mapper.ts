import { IClientCountry, IClientState } from "@znode/clients/v1";
import { IState, ICountry } from "@znode/types/common";


export const mapCountryValues = (countryList: IClientCountry[]): ICountry[] | [] => {
  if (countryList && countryList.length > 0) {
    return countryList.map((country: IClientCountry) => ({
      countryId: country.CountryId,
      countryCode: country.CountryCode,
      countryName: country.CountryName,
      isDefault: country.IsDefault,
    }));
  }
  return [];
};
export const mapStateValues = (stateList: IClientState[]): IState[] | [] => {
  if (stateList && stateList.length > 0) {
    return stateList.map((country: IClientState) => ({
      stateName: country.StateName,
      stateCode: country.StateCode,
      stateId: country.StateId,
      isDefault: country.IsDefault,
    }));
  }
  return [];
};
