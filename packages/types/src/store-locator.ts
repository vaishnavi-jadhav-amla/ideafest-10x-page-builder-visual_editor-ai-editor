export interface IStoreLocatorFilter {
  city: string;
  postalCode: string;
  state: string;
  portalId?: number;
  radiusList: IStoreRadius[] | [];
}
export interface IStore {
  city: string;
  postalCode: string;
  state: string;
  portalId: number;
}

export interface IStoreRadius {
  text: string;
  value: string;
  selected: false;
}

export interface ISearchParams {
  stateName?: string;
  cityName?: string;
  city?: string;
  storeName?: string;
  postalCode?: string;
  state?: string;
  type?: string;
}

export interface IStores extends IStoreLocatorFilter {
  stores: IStore | [];
}

export interface IStoreLocator {
  addressId?: number;
  portalId?: number;
  radius?: number;
  storeName?: string;
  radiusList?: ISelectListItem[];
  portalList?: IStoreLocator | undefined;
  postalCode?: string;
  city?: string;
  state?: string;
  stores?: IStoreList[];
  custom?: { storeLocationCode: string };
  Locations?: { latitude: number; longitude: number };
  steps?: { distance?: { text: string }; duration?: { text: string }; end_address?: string; steps?: string[] };
}

export interface ISelectListItem {
  text?: string;
  value?: string;
  selected?: boolean;
}

export interface IStoreList {
  mapQuestURL?: string;
  stateName?: string;
  cityName?: string;
  address1?: string;
  phoneNumber?: string;
  storeName?: string;
  postalCode?: number;
  storeLocatorList?: string[];
  countryName?: string;
  latitude?: number;
  longitude?: number;
  storeLocationCode?: string;
}

export interface IAddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface IGeometry {
  bounds: IBounds;
  location: ILocation;
  locationType: string;
  viewport: IBounds;
}

export interface ILocation {
  lat: number;
  lng: number;
}

export interface IBounds {
  northeast: ILocation;
  southwest: ILocation;
}

export interface ISearchLocation {
  addressComponents: IAddressComponent[];
  formattedAddress: string;
  geometry: IGeometry;
  placeId: string;
  postcodeLocalities: string[];
  types: string[];
  partialMatch?: boolean;
}

export interface ISearchLocationResponse {
  results: ISearchLocation[];
  status: string;
}

export interface IStoreLocatorResponse {
  data: IStoreLocator;
  message?: string;
  status?: string;
}
