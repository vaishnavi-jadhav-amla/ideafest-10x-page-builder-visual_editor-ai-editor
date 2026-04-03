/**
 * Get list of store locator.
 * @param filter (optional)
 * @param sort (optional)
 * @return OK
 */

import { addCacheOption, buildEndpointQueryString, getHeaders } from "./base";
import { FilterTuple } from "./multifront-types";
import * as Models from "./multifront-types";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

export async function WebStoreLocator_list(filter: FilterTuple[] | undefined, sort: { [key: string]: string } | undefined): Promise<any> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),
  };
  options_ = addCacheOption(filter ?? [], options_);

  let url_ = baseUrl + "WebStoreLocator/List";
  url_ += buildEndpointQueryString({ filter, sort });
  if (filter === null) throw new Error("The parameter 'filter' cannot be null.");
  if (sort === null) throw new Error("The parameter 'sort' cannot be null.");
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "WebStoreLocator_list").then((_response: Response) => {
    return WebStoreLocator_processList(_response);
  });
}

function WebStoreLocator_processList(response: Response): Promise<any> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.WebStoreLocatorResponse);
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      let result204: any = null;
      result204 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("No Content", status, _responseText, _headers, result204);
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException("An unexpected server error occurred.", status, _responseText, _headers);
    });
  }
  return Promise.resolve<any>(null as any);
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): any {
  try {
    if (result !== null && result !== undefined) throw result;
    else throw new Error(message);
  } catch (ex) {
    const parsedRes = response === "" ? null : (JSON.parse(response) as any);
    return parsedRes;
  }
}
