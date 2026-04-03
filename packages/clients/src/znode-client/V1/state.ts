/* eslint-disable prefer-const */
import * as Models from "../../types/multifront-types";
import { addCacheOption, buildEndpointQueryString, getHeaders } from "./base";
import { FilterTuple } from "../../types/multifront-types";
import * as MultifrontTypes from "../../types/multifront-types";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

/**
 * Gets list of all states.
 * @param expand (optional)
 * @param filter (optional)
 * @param sort (optional)
 * @param pageIndex (optional)
 * @param pageSize (optional)
 * @return OK
 */

export async function State_list(
  expand: string[] | undefined,
  filter: FilterTuple[] | undefined,
  sort: { [key: string]: string } | undefined,
  pageIndex: number | undefined,
  pageSize: number | undefined,
  cacheInvalidator?: FilterTuple[] | undefined): Promise<MultifrontTypes.StateListResponse> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),
    next: { revalidate: 0 },
  };
  options_ = addCacheOption(cacheInvalidator ?? [], options_);

  let url_ = baseUrl + "State/List";
  url_ += buildEndpointQueryString({
    expand,
    filter,
    sort,
    pageIndex,
    pageSize,
  });

  if (expand === null)
    throw new Error("The parameter 'expand' cannot be null.");
  if (filter === null)
    throw new Error("The parameter 'filter' cannot be null.");
  if (sort === null) throw new Error("The parameter 'sort' cannot be null.");
  if (pageIndex === null)
    throw new Error("The parameter 'pageIndex' cannot be null.");
  if (pageSize === null)
    throw new Error("The parameter 'pageSize' cannot be null.");
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "State_list").then((_response: Response) => {
    return State_processList(_response);
  });
}

function State_processList(
  response: Response
): Promise<MultifrontTypes.StateListResponse> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => _headers[k] = v); };
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 =
      _responseText === "" 
      ? null
      : JSON.parse(_responseText) as Models.StateListResponse;
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      let result204: any = null;
      result204 =
      _responseText === "" 
      ? null
       : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
      return throwException
      ("No Content", 
        status,
        _responseText,
        _headers,
        result204
      );
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException(
        "An unexpected server error occurred.", 
        status,
        _responseText,
        _headers
      );
    });
  }
  return Promise.resolve<any>(null as any);
}

/**
 * Get list of associate countries based on portal.
 * @param expand (optional)
 * @param filter (optional)
 * @param sort (optional)
 * @param pageIndex (optional)
 * @param pageSize (optional)
 * @return OK
 */

export async function PortalCountry_getAssociatedCountryList(
  expand: string[] | undefined,
  filter: FilterTuple[] | undefined,
  sort: { [key: string]: string } | undefined,
  pageIndex: number | undefined,
  pageSize: number | undefined,
  cacheInvalidator?: FilterTuple[] | undefined): Promise<MultifrontTypes.CountryListResponse> {
  let options_: RequestInit = {
    method: "GET",
    cache: "no-store",
    headers: await getHeaders("GET", String(baseUrl)),
  };
  options_ = addCacheOption(cacheInvalidator ?? [], options_);

  let url_ = baseUrl + "PortalCountry/GetAssociatedCountryList";
  url_ += buildEndpointQueryString({
    expand,
    filter,
    sort,
    pageIndex,
    pageSize,
  });

  if (expand === null)
    throw new Error("The parameter 'expand' cannot be null.");
  if (filter === null)
    throw new Error("The parameter 'filter' cannot be null.");
  if (sort === null) throw new Error("The parameter 'sort' cannot be null.");
  if (pageIndex === null)
    throw new Error("The parameter 'pageIndex' cannot be null.");
  if (pageSize === null)
    throw new Error("The parameter 'pageSize' cannot be null.");
  url_ = url_.replace(/[?&]$/, '');

  return customFetch(url_, options_, "PortalCountry_getAssociatedCountryList").then((_response: Response) => {
    return PortalCountry_processGetAssociatedCountryList(_response);
  });
}

function PortalCountry_processGetAssociatedCountryList(
  response: Response
): Promise<MultifrontTypes.CountryListResponse> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : JSON.parse(_responseText) as Models.CountryListResponse;
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      let result204: any = null;
      result204 = 
      _responseText === "" 
      ? null
       : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
      return throwException
      ("No Content",
        status,
        _responseText,
        _headers,
        result204
      );
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException(
        "An unexpected server error occurred.", 
        status,
        _responseText,
        _headers
      );
    });
  }
  return Promise.resolve<any>(null as any);
}
function throwException(
  message: string,
  status: number,
  response: string,
  headers: { [key: string]: any },
  result?: any
): any {
  try {
    if (result !== null && result !== undefined) throw result;
    else throw new Error(message);
  } catch (ex) {
    const parsedRes = response === '' ? null : (JSON.parse(response) as any);
    return parsedRes;
  }
}
