import * as Models from "../../types/multifront-types";

import { addCacheOption, buildEndpointQueryString, getHeaders } from "./base";

import { FilterTuple } from "@znode/clients/v1";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;
/**
 * Get list of payment settings by userId and portalId using UserPaymentSettingModel
 * @param body (optional) UserPaymentSettingModel
 * @return OK
 */

export async function Payment_getPaymentSettingByUserDetails(body: Models.UserPaymentSettingModel | undefined): Promise<any> {
  let url_ = baseUrl + "Payment/GetPaymentSettingByUserDetails";
  url_ = url_.replace(/[?&]$/, "");

  const content_ = JSON.stringify(body);

  let options_: RequestInit = {
    body: content_,
    method: "POST",
    cache: "no-store",
    headers: await getHeaders("POST", String(baseUrl)),
  };

  return customFetch(url_, options_, "Payment_getPaymentSettingByUserDetails").then((_response: Response) => {
    return Payment_processGetPaymentSettingByUserDetails(_response);
  });
}

function Payment_processGetPaymentSettingByUserDetails(response: Response): Promise<any> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.PaymentSettingListResponse);
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

/**
 * Get the list of Payment Setting.
 * @param expand (optional)
 * @param filter (optional)
 * @param sort (optional)
 * @param pageIndex (optional)
 * @param pageSize (optional)
 * @return OK
 */

export async function Payment_list(
  expand: string[] | undefined,
  filter: FilterTuple[] | undefined,
  sort: { [key: string]: string } | undefined,
  pageIndex: number | undefined,
  pageSize: number | undefined
): Promise<any> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),
  };
  options_ = addCacheOption(filter ?? [], options_);

  let url_ = baseUrl + "Payment/List";
  url_ += buildEndpointQueryString({ expand, filter, sort, pageIndex, pageSize });
  if (expand === null) throw new Error("The parameter 'expand' cannot be null.");
  if (filter === null) throw new Error("The parameter 'filter' cannot be null.");
  if (sort === null) throw new Error("The parameter 'sort' cannot be null.");
  if (pageIndex === null) throw new Error("The parameter 'pageIndex' cannot be null.");
  if (pageSize === null) throw new Error("The parameter 'pageSize' cannot be null.");
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "Payment_list").then((_response: Response) => {
    return Payment_processList(_response);
  });
}

function Payment_processList(response: Response): Promise<any> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.PaymentSettingListResponse);
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
