import { customFetch } from "../../common/customFetch";
import { getHeaders } from "./base";

const baseUrl = process.env.API_URL;
/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

/**
 * Submit Manage BStore request.
 * @param userId The User ID for the request.
 * @param portalId The Portal ID for the request.
 * @return Success. The request was successfully executed, and the response body contains the impersonation URL.
 */
export async function User_submitManageBStoreRequest(userId: number, storeCode: string): Promise<string> {
  let options_: RequestInit = {
    method: "POST",
    headers: await getHeaders("POST", String(baseUrl)),

    next: { revalidate: 0 },
  };

  let url_ = baseUrl + `v2/bstores/managebstore/${storeCode}/${userId}`;
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "User_submitManageBStoreRequest").then((_response: Response) => {
    return processManageBStoreResponse(_response);
  });
}

function processManageBStoreResponse(response: Response): Promise<string> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }

  if (status === 200 || status === 201) {
    return response.text().then((_responseText) => {
      return _responseText;
    });
  } else {
    return response.text().then((_responseText) => {
      return throwException("An error occurred during manage request.", status, _responseText, _headers);
    });
  }
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
