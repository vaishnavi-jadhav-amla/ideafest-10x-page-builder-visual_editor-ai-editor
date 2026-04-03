import * as Models from "./multifront-types";

import { getHeaders } from "./base";
import * as MultifrontTypes from "./multifront-types";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

export async function ProductFacet_productFacet(
  searchKeyword: string,
  categoryCode: string,
  brandCode: string,
  catalogCode: string,
  storeCode: string,
  localeCode: string
): Promise<MultifrontTypes.FacetResponse> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),
    next: { revalidate: 0 },
  };

  let url_ = baseUrl + "v2/facets";

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "CatalogCode=" + encodeURIComponent("" + catalogCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "LocaleCode=" + encodeURIComponent("" + localeCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "StoreCode=" + encodeURIComponent("" + storeCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "searchKeyword=" + encodeURIComponent("" + searchKeyword);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "CategoryCode=" + encodeURIComponent("" + categoryCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "BrandCode=" + encodeURIComponent("" + brandCode);

  if (catalogCode === undefined || catalogCode === null) throw new Error("The parameter 'catalogCode' must be defined and cannot be null.");
  else if (localeCode === null) throw new Error("The parameter 'localeCode' cannot be null.");
  if (storeCode === null) throw new Error("The parameter 'storeCode' cannot be null.");
  url_ = url_.replace(/[?&]$/, "");
  return customFetch(url_, options_, "ProductFacet_productFacet").then((_response: Response) => {
    return ProductFacet_processProductFacet(_response);
  });
}

function ProductFacet_processProductFacet(response: Response): Promise<MultifrontTypes.FacetResponse> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.CategoryContentResponse);
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
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException("An unexpected server error occurred.", status, _responseText, _headers);
    });
  }
  return Promise.resolve<any>(null as any);
}

export async function CategoryBySearchTerm_categoryBySearchTerm(
  searchKeyword: string,
  categoryCode: string,
  categoryHierarchy: string,
  catalogCode: string,
  storeCode: string,
  localeCode: string
): Promise<MultifrontTypes.CategoryFacetResponse> {
  let options_: RequestInit = {
    method: "GET",
    headers: await getHeaders("GET", String(baseUrl)),
    next: { revalidate: 0 },
  };

  let url_ = baseUrl + "v2/categoryfacetbysearch";

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "CatalogCode=" + encodeURIComponent("" + catalogCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "LocaleCode=" + encodeURIComponent("" + localeCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "storeCode=" + encodeURIComponent("" + storeCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "searchKeyword=" + encodeURIComponent("" + searchKeyword);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "CategoryCode=" + encodeURIComponent("" + categoryCode);

  url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "categoryHierarchy=" + encodeURIComponent("" + categoryHierarchy);

  if (catalogCode === undefined || catalogCode === null) throw new Error("The parameter 'catalogCode' must be defined and cannot be null.");
  else if (localeCode === null) throw new Error("The parameter 'localeCode' cannot be null.");
  if (storeCode === null) throw new Error("The parameter 'storeCode' cannot be null.");
  url_ = url_.replace(/[?&]$/, "");
  return customFetch(url_, options_, "CategoryBySearchTerm_categoryBySearchTerm").then((_response: Response) => {
    return CategoryBySearchTerm_processCategoryBySearchTerm(_response);
  });
}

function CategoryBySearchTerm_processCategoryBySearchTerm(response: Response): Promise<MultifrontTypes.CategoryFacetResponse> {
  const status = response.status;
  let _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === "" ? null : (JSON.parse(_responseText) as Models.CategoryFacetResponse);
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
