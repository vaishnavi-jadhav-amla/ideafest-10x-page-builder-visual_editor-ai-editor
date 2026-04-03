import * as Models from "../../types/multifront-types";
import { getHeaders } from "./base";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

function throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): any {
  try {
    if (result !== null && result !== undefined) throw result;
    else throw new Error(message);
  } catch (ex) {
    const parsedRes = response === "" ? null : (JSON.parse(response) as any);
    return parsedRes;
  }
}

export async function Shipping_recommendedAddress(body: Models.AddressModel | undefined): Promise<any> {
  let url_ = baseUrl + "Shipping/RecommendedAddress";
  url_ = url_.replace(/[?&]$/, "");

  const content_ = JSON.stringify(body);

  let options_: RequestInit = {
    body: content_,
    method: "POST",
    cache: "no-store",
    headers: await getHeaders("POST", String(baseUrl)),
  };

  return customFetch(url_, options_, "Shipping_recommendedAddress").then((_response: Response) => {
    return Shipping_processRecommendedAddress(_response);
  });
}

function Shipping_processRecommendedAddress(response: Response): Promise<any> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.AddressListResponse);
      return result200;
    });
  } else if (status === 201) {
    return response.text().then((_responseText) => {
      let result201: any = null;
      result201 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.AddressListResponse);
      return result201;
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException("An unexpected server error occurred.", status, _responseText, _headers);
    });
  }
  return Promise.resolve<any>(null as any);
}
