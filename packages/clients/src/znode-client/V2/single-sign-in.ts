/**
 * Handles generation of login token.
 * @param userName The user for which the token needs to be generated
 * @param body (optional) The model conatins the storecode and password.
 * @return Success(Indicates that the request is successfully executed and the response body return the data in UserDetailResponse model.)
 */

import * as Models from "./multifront-types";
import { getHeaders } from "./base";
import * as MultifrontTypes from "./multifront-types";
import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

/**
 * Validates the login token.
 * @param body (optional) The login token to validate.
 * @return Indicates that the request is successfully executed and the response body contains the requested data.
 */

export async function Users_validateLoginToken(body: Models.ImpersonationRequestModel | undefined): Promise<MultifrontTypes.UserLoginResponse> {
  let url_ = baseUrl + "v2/users/validate-login-token";

  url_ = url_.replace(/[?&]$/, "");

  const content_ = JSON.stringify(body);

  let options_: RequestInit = {
    body: content_,
    method: "POST",
    cache: "no-store",
    headers: await getHeaders("POST", String(baseUrl)),
  };

  return customFetch(url_, options_, "Users_validateLoginToken").then((_response: Response) => {
    return Users_processValidateLoginToken(_response);
  });
}

function Users_processValidateLoginToken(response: Response): Promise<MultifrontTypes.UserLoginResponse> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.UserLoginResponse);
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      let result204: any = null;
      result204 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Indicates that the request is successfully executed, but the response body does not contain any data.", status, _responseText, _headers, result204);
    });
  } else if (status === 400) {
    return response.text().then((_responseText) => {
      let result400: any = null;
      result400 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Indicates that the request contains invalid data.", status, _responseText, _headers, result400);
    });
  } else if (status === 500) {
    return response.text().then((_responseText) => {
      let result500: any = null;
      result500 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Indicates that an error occurred on the server.", status, _responseText, _headers, result500);
    });
  } else if (status === 404) {
    return response.text().then((_responseText) => {
      let result404: any = null;
      result404 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Not Found. The server cannot find the requested resource.", status, _responseText, _headers, result404);
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

/**
 * Handles generation of login token.
 * @param userName The user for which the token needs to be generated
 * @param body (optional) The model conatins the storecode and password.
 * @return Success(Indicates that the request is successfully executed and the response body return the data in UserDetailResponse model.)
 */

export async function Users_loginToken(userName: string, body: Models.GenerateTokenRequestModel | undefined): Promise<MultifrontTypes.UserLoginTokenResponse> {
  let url_ = baseUrl + "v2/users/login-token/{userName}";

  if (userName === undefined || userName === null) throw new Error("The parameter 'userName' must be defined.");
  url_ = url_.replace("{userName}", encodeURIComponent("" + userName));
  url_ = url_.replace(/[?&]$/, "");

  const content_ = JSON.stringify(body);

  let options_: RequestInit = {
    body: content_,
    method: "POST",
    cache: "no-store",
    headers: await getHeaders("POST", String(baseUrl)),
  };

  return customFetch(url_, options_, "Users_loginToken").then((_response: Response) => {
    return Users_processLoginToken(_response);
  });
}

function Users_processLoginToken(response: Response): Promise<MultifrontTypes.UserLoginTokenResponse> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.UserLoginTokenResponse);
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      let result204: any = null;
      result204 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException(
        "No Content(Indicates that the request is successfully executed, but the response body does not contain any data.)",
        status,
        _responseText,
        _headers,
        result204
      );
    });
  } else if (status === 400) {
    return response.text().then((_responseText) => {
      let result400: any = null;
      result400 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Bad Request(The request contain invalid Data.)", status, _responseText, _headers, result400);
    });
  } else if (status === 500) {
    return response.text().then((_responseText) => {
      let result500: any = null;
      result500 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Server Error(Indicates that an error occurred on the server.)", status, _responseText, _headers, result500);
    });
  } else if (status === 404) {
    return response.text().then((_responseText) => {
      let result404: any = null;
      result404 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.ZnodeErrorDetail);
      return throwException("Not Found. The server cannot find the requested resource.", status, _responseText, _headers, result404);
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException("An unexpected server error occurred.", status, _responseText, _headers);
    });
  }
  return Promise.resolve<any>(null as any);
}
