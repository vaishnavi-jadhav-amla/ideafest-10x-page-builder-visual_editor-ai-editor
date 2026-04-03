import * as Models from "../../types/multifront-types";

import { addCacheOption, buildEndpointQueryString, getHeaders, throwException } from "./base";

import { FilterTuple } from "../../types/multifront-types";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

/**
 * Get the list of all Returns.
 * @param expand (optional)
 * @param filter (optional)
 * @param sort (optional)
 * @param pageIndex (optional)
 * @param pageSize (optional)
 * @return OK
 */

export async function RMAReturn_list(
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

  let url_ = baseUrl + "RMAReturn/List";
  url_ += buildEndpointQueryString({ expand, filter, sort, pageIndex, pageSize });
  if (expand === null) throw new Error("The parameter 'expand' cannot be null.");
  if (filter === null) throw new Error("The parameter 'filter' cannot be null.");
  if (sort === null) throw new Error("The parameter 'sort' cannot be null.");
  if (pageIndex === null) throw new Error("The parameter 'pageIndex' cannot be null.");
  if (pageSize === null) throw new Error("The parameter 'pageSize' cannot be null.");
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "RMAReturn_list").then((_response: Response) => {
    return RMAReturn_processList(_response);
  });
}

function RMAReturn_processList(response: Response): Promise<any> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.RMAReturnListResponse);
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      let result204: any = null;
      result204 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("No Content",  _responseText,"" );
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException("An unexpected server error occurred.", _responseText, "");
    });
  }
  return Promise.resolve<any>(null as any);
}
