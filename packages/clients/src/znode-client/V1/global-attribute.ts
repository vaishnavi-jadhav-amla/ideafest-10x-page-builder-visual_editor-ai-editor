import * as Models from "../../types/multifront-types";
import { getHeaders } from "./base";
import { FilterTuple } from "../../types/multifront-types";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

export function throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): any {
  try {
    if (result !== null && result !== undefined) throw result;
    else throw new Error(message);
  } catch (ex) {
    const parsedRes = response === "" ? null : (JSON.parse(response) as any);
    return parsedRes;
  }
}

export async function GlobalAttributeEntity_getGlobalEntityAttributes(
  entityId: number,
  entityType: string,
  expand: string[],
  filter: FilterTuple[],
  sort: { [key: string]: string },
  pageIndex: number,
  pageSize: number
): Promise<any> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),
    next: { revalidate: 0 },
  };

  let url_ = baseUrl + "GlobalAttributeEntity/GetGlobalEntityAttributes/{entityId}/{entityType}";
  if (entityId === undefined || entityId === null) throw new Error("The parameter 'entityId' must be defined.");
  url_ = url_.replace("{entityId}", encodeURIComponent("" + entityId));
  if (entityType === undefined || entityType === null) throw new Error("The parameter 'entityType' must be defined.");
  url_ = url_.replace("{entityType}", encodeURIComponent("" + entityType));
  if (expand === undefined || expand === null) throw new Error("The parameter 'expand' must be defined.");
  url_ = url_.replace("{expand}", encodeURIComponent(expand.join()));
  if (filter === undefined || filter === null) throw new Error("The parameter 'filter' must be defined.");
  url_ = url_.replace("{filter}", encodeURIComponent(filter.join()));
  if (sort === undefined || sort === null) throw new Error("The parameter 'sort' must be defined.");
  url_ = url_.replace("{sort}", encodeURIComponent("" + sort));
  if (pageIndex === undefined || pageIndex === null) throw new Error("The parameter 'pageIndex' must be defined.");
  url_ = url_.replace("{pageIndex}", encodeURIComponent("" + pageIndex));
  if (pageSize === undefined || pageSize === null) throw new Error("The parameter 'pageSize' must be defined.");
  url_ = url_.replace("{pageSize}", encodeURIComponent("" + pageSize));
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "GlobalAttributeEntity_getGlobalEntityAttributes").then((_response: Response) => {
    return GlobalAttributeEntity_processGetGlobalEntityAttributes(_response);
  });
}

function GlobalAttributeEntity_processGetGlobalEntityAttributes(response: Response): Promise<any> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.GlobalSelectedAttributeEntityResponse);
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
