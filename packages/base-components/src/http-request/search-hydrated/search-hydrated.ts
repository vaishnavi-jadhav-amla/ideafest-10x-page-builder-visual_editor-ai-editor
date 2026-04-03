import { IHydratedSearchModel } from "@znode/types/search-params";
import { IProductPricingDetailsResponse } from "@znode/types/search-typeahead";
import { httpRequest } from "../base";
import { objectToQueryString } from "@znode/utils/component";

export const getSearchRedirectURL = async (props: { [key: string]: string | number }) => {
  const queryString: string = objectToQueryString(props);
  const searchRedirectKeywordList = await httpRequest<string>({ endpoint: `/api/search/search-redirect?${queryString}` });
  return searchRedirectKeywordList;
};

export const getHydratedSuggestionSearch = async (props: { [key: string]: string | number }) => {
  const queryString: string = objectToQueryString(props);
  const hydratedSearchData = await httpRequest<IHydratedSearchModel>({ endpoint: `/api/search/search-hydrated?${queryString}` });
  return hydratedSearchData;
};

export const getSuggestions = async (props:{ [key: string]: string | number }) => {
  const queryString: string = objectToQueryString(props);
  const suggestionList = await httpRequest<IHydratedSearchModel>({ endpoint:`/api/search/search-suggestions?${queryString}` });
  return suggestionList;
};

export const getHydratedTypeaheadSearchContent = async (props: { [key: string]: string }) => {
  const queryString: string = objectToQueryString(props);
  const hydratedSearchData = await httpRequest<IHydratedSearchModel>({ endpoint: `/api/search/search-hydrated-typeahead?${queryString}` });
  return hydratedSearchData;
};

export const getPrice = async (props: { [key: string]: string }) => {
  const queryString: string = objectToQueryString(props);
  const priceList = await httpRequest<IProductPricingDetailsResponse>({ endpoint: `/api/search/search-typeahead-pricelist?${queryString}` });
  return priceList;
};