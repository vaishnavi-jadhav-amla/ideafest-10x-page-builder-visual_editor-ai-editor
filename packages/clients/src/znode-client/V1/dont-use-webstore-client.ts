//to be deleted

export async function WebStoreWidget_getSlider(key: string, body: any | undefined): Promise<any> {
    let url_ = process.env.API_URL + "WebStoreWidget/GetSlider/{key}";
    if (key === undefined || key === null) throw new Error("The parameter 'key' must be defined.");
    url_ = url_.replace("{key}", encodeURIComponent("" + key));
    url_ = url_.replace(/[?&]$/, "");
    const content_ = JSON.stringify(body);
  
    const options_: RequestInit = {
      body: content_,
      method: "PUT",
      headers: await getApiHeaders("PUT"),
    };
  
    return customFetch(url_, options_, "WebStoreWidget_getSlider").then((_response: Response) => {
      return WebStoreWidget_processGetSlider(_response);
    });
  }

  function WebStoreWidget_processGetSlider(response: Response): Promise<any> {
    const status = response.status;
    const _headers: any = {};
    if (response.headers && response.headers.forEach) {
      response.headers.forEach((v: any, k: any) => (_headers[k] = v));
    }
    if (status === 200) {
      return response.text().then((_responseText) => {
        let result200: any = null;
        result200 = _responseText === "" ? null : (JSON.parse(_responseText) as any);
        return result200;
      });
    } else if (status === 204) {
      return response.text().then((_responseText) => {
        let result204: any = null;
        result204 = _responseText === "" ? null : (JSON.parse(_responseText) as any);
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


   async function getApiHeaders(requestType: string): Promise<HeadersInit> {

    const requestHeaders: HeadersInit = new Headers();
    if (requestType?.toLowerCase() == "post" || requestType?.toLowerCase() == "put") requestHeaders.set("Content-Type", "application/json-patch+json" || "");
   
    requestHeaders.set("Znode-Locale", String(1) || "");
    requestHeaders.set("Znode-DomainName", "webstore-z10-dev10.znodecorp.com");
    requestHeaders.set("Znode-PublishState", "PRODUCTION");
    requestHeaders.set("Accept", "text/plain");
    requestHeaders.set("Cache-Control", "no-store");
;
    return requestHeaders;
  }