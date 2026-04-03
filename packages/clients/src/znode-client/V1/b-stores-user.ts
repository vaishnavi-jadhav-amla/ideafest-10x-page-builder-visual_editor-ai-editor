import { getHeaders } from "./base";
import { BStoresUserRoleResponseModel } from "../../types/multifront-types";
import { customFetch } from "../../common/customFetch";

const baseUrl = process.env.API_URL;

/**
 * Get User BStore Role Access by UserId.
 * @param userId The ID of the user whose BStore role access is requested.
 * @return Success. The request was successfully executed, and the response body contains the result.
 */
export async function User_getBStoreRoleAccess(userId: string): Promise<BStoresUserRoleResponseModel> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),

    next: { revalidate: 0 },
  };

  let url_ = `${baseUrl}BStoresUser/GetUserBStoreRoleAccess/${encodeURIComponent(userId)}`;
  url_ = url_.replace(/[?&]$/, "");

  return customFetch(url_, options_, "User_getBStoreRoleAccess").then((_response: Response) => {
    return processGetUserBStoreRoleAccessResponse(_response);
  });
}

function processGetUserBStoreRoleAccessResponse(response: Response): Promise<BStoresUserRoleResponseModel> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }

  if (status === 200 || status === 201) {
    return response.text().then((_responseText) => {
      let result: any = null;
      result = _responseText === "" ? null : (JSON.parse(_responseText) as BStoresUserRoleResponseModel);
      return result;
    });
  } else {
    return response.text().then((_responseText) => {
      return throwException("An error occurred while fetching user BStore role access.", status, _responseText, _headers);
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
