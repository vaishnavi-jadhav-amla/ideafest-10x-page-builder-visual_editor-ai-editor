import { customFetch } from "packages/clients/src/common/customFetch";
import { getHeaders } from "../../V2/base";
import { IUserActivityLog } from "@znode/types/user-activity";

const baseUrl = process.env.API_URL;

export async function User_activity(body: IUserActivityLog[]): Promise<string | null> {
  let url_ = baseUrl + "api/user-activity";

  url_ = url_.replace(/[?&]$/, "");

  const content_ = JSON.stringify(body);

  let options_: RequestInit = {
    body: content_,
    method: "POST",

    headers: await getHeaders("POST", String(baseUrl)),
  };

  return customFetch(url_, options_, "User_activity").then((_response: Response) => {
    return User_processActivity(_response);
  });
}

function User_processActivity(response: Response): Promise<any> {
  const status = response.status;
  const _headers: { [key: string]: any } = {};

  if (response.headers && response.headers.forEach) {
    response.headers.forEach((value, key) => {
      _headers[key] = value;
    });
  }

  if (status === 200) {
    return response.text().then((_responseText) => {
      const result200 = _responseText === "" ? null : _responseText;
      return result200;
    });
  } else if (status === 204) {
    return response.text().then((_responseText) => {
      const result204 = _responseText === "" ? null : _responseText;
      return throwException("No Content (Request successful, but no response body).", status, _responseText, _headers, result204);
    });
  } else if (status === 400) {
    return response.text().then((_responseText) => {
      const result400 = _responseText === "" ? null : _responseText;
      return throwException("Bad Request (The request contains invalid data).", status, _responseText, _headers, result400);
    });
  } else if (status === 500) {
    return response.text().then((_responseText) => {
      const result500 = _responseText === "" ? null : _responseText;
      return throwException("Server Error (An error occurred on the server).", status, _responseText, _headers, result500);
    });
  } else {
    return response.text().then((_responseText) => {
      return throwException("An unexpected server error occurred.", status, _responseText, _headers);
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
