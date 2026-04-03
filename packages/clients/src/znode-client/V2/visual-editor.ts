
import * as Models from "./multifront-types";

import { getHeaders } from "./base";
import { FilterTuple } from "./multifront-types";

import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

 /**
 * Retrieves the page details.
 * @param pageCode Page Code is used to get visual editor page details.
 * @param portalCode Portal Code is used to get visual editor page details associated with a portal.
 * @param profileCode Profile Code is used to get visual editor page details associated with a profile.
 * @return Success(Indicates that the request is successfully executed and the response body return the data in PageDetailsResponse model.)
 */
export async function VisualEditor_pagesGetByPageCode(pageCode: string, portalCode: string, profileCode: string, cacheInvalidator?: FilterTuple[] | undefined): Promise<any> {

    let options_: RequestInit = {
        method: "GET",
        headers: await getHeaders("GET", String(baseUrl)),
        next: { revalidate: 0 }
    };

    let url_ = baseUrl + "v2/visual-editor/pages/{pageCode}/{portalCode}/{profileCode}";

    if (pageCode === undefined || pageCode === null)
        throw new Error("The parameter 'pageCode' must be defined.");
    url_ = url_.replace("{pageCode}", encodeURIComponent("" + pageCode));
    if (portalCode === undefined || portalCode === null)
        throw new Error("The parameter 'portalCode' must be defined.");
    url_ = url_.replace("{portalCode}", encodeURIComponent("" + portalCode));
    if (profileCode === undefined || profileCode === null)
        throw new Error("The parameter 'profileCode' must be defined.");
    url_ = url_.replace("{profileCode}", encodeURIComponent("" + profileCode));
    url_ = url_.replace(/[?&]$/, "");


    return customFetch(url_, options_, "VisualEditor_pagesGetByPageCode").then((_response: Response) => {

        return VisualEditor_processPagesGetByPageCode(_response);

    });
}


function VisualEditor_processPagesGetByPageCode(response: Response): Promise<any> {
    const status = response.status;
    let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
    if (status === 200) {
        return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : JSON.parse(_responseText) as Models.PageDetailsResponse;
            return result200;
        });
    } else if (status === 204) {
        return response.text().then((_responseText) => {
            let result204: any = null;
            result204 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("No Content(Indicates that the request is successfully executed, but the response body does not contain any data.)", status, _responseText, _headers, result204);
        });
    } else if (status === 400) {
        return response.text().then((_responseText) => {
            let result400: any = null;
            result400 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Bad Request(The request contain invalid Data.)", status, _responseText, _headers, result400);
        });
    } else if (status === 404) {
        return response.text().then((_responseText) => {
            let result404: any = null;
            result404 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Not Found. The server cannot find the requested resource.", status, _responseText, _headers, result404);
        });
    } else if (status === 500) {
        return response.text().then((_responseText) => {
            let result500: any = null;
            result500 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Server Error(Indicates that an error occurred on the server.)", status, _responseText, _headers, result500);
        });
    } else if (status !== 200 && status !== 204) {
        return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        });
    }
    return Promise.resolve<any>(null as any);
}

  
  
    
    
    

  
  
    
  

/**
    * Retrieves the preview page details.
    * @param pageCode Page Code is used to get visual editor page details.
    * @param portalCode Portal Code is used to get visual editor page details associated with a portal.
    * @param profileCode Profile Code is used to get visual editor page details associated with a profile.
    * @return Success(Indicates that the request is successfully executed and the response body return the data in PageDetailsResponse model.)
    */

export async function VisualEditor_pagesPreviewByPageCode(pageCode: string, portalCode: string, profileCode: string, versionNumber?: number, cacheInvalidator?: FilterTuple[] | undefined): Promise<any> {


    let options_: RequestInit = {
        method: "GET",
        headers: await getHeaders("GET", String(baseUrl)),
        next: { revalidate: 0 }
    };

    let url_ = baseUrl + "v2.1/visual-editor/pages-preview/{pageCode}/{portalCode}/{profileCode}";

     if(versionNumber !== undefined){
        url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "versionNumber=" + encodeURIComponent("" + versionNumber);
    }

    if (pageCode === undefined || pageCode === null)
        throw new Error("The parameter 'pageCode' must be defined.");
    url_ = url_.replace("{pageCode}", encodeURIComponent("" + pageCode));
    if (portalCode === undefined || portalCode === null)
        throw new Error("The parameter 'portalCode' must be defined.");
    url_ = url_.replace("{portalCode}", encodeURIComponent("" + portalCode));
    if (profileCode === undefined || profileCode === null)
        throw new Error("The parameter 'profileCode' must be defined.");
    url_ = url_.replace("{profileCode}", encodeURIComponent("" + profileCode));
    url_ = url_.replace(/[?&]$/, "");

    return customFetch(url_, options_, "VisualEditor_pagesPreviewByPageCode").then((_response: Response) => {

        return VisualEditor_processPagesPreviewByPageCode(_response);

    });
}


function VisualEditor_processPagesPreviewByPageCode(response: Response): Promise<any> {
    const status = response.status;
    let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
    if (status === 200) {
        return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : JSON.parse(_responseText) as Models.PageDetailsResponse;
            return result200;
        });
    } else if (status === 204) {
        return response.text().then((_responseText) => {
            let result204: any = null;
            result204 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("No Content(Indicates that the request is successfully executed, but the response body does not contain any data.)", status, _responseText, _headers, result204);
        });
    } else if (status === 400) {
        return response.text().then((_responseText) => {
            let result400: any = null;
            result400 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Bad Request(The request contain invalid Data.)", status, _responseText, _headers, result400);
        });
    } else if (status === 404) {
        return response.text().then((_responseText) => {
            let result404: any = null;
            result404 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Not Found. The server cannot find the requested resource.", status, _responseText, _headers, result404);
        });
    } else if (status === 500) {
        return response.text().then((_responseText) => {
            let result500: any = null;
            result500 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Server Error(Indicates that an error occurred on the server.)", status, _responseText, _headers, result500);
        });
    } else if (status !== 200 && status !== 204) {
        return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        });
    }
    return Promise.resolve<any>(null as any);


    }

  
  
    
    
    

  
  
    
  

/**
    * Retrieves the content page details.
    * @param pageCode Page Code is used to get visual editor page details.
    * @param portalCode Portal Code is used to get visual editor page details associated with a portal.
    * @param profileCode Profile Code is used to get visual editor page details associated with a profile.
    * @return Success(Indicates that the request is successfully executed and the response body return the data in ContentPageDetailsResponse model.)
    */

export async function VisualEditor_contentPagesGetByPageCode(pageCode: string, portalCode: string, profileCode: string, cacheInvalidator?: FilterTuple[] | undefined): Promise<any> {


    let options_: RequestInit = {
        method: "GET",
        headers: await getHeaders("GET", String(baseUrl)),
        next: { revalidate: 0 }
    };

    let url_ = baseUrl + "v2/visual-editor/content-pages/{pageCode}/{portalCode}/{profileCode}";

    if (pageCode === undefined || pageCode === null)
        throw new Error("The parameter 'pageCode' must be defined.");
    url_ = url_.replace("{pageCode}", encodeURIComponent("" + pageCode));
    if (portalCode === undefined || portalCode === null)
        throw new Error("The parameter 'portalCode' must be defined.");
    url_ = url_.replace("{portalCode}", encodeURIComponent("" + portalCode));
    if (profileCode === undefined || profileCode === null)
        throw new Error("The parameter 'profileCode' must be defined.");
    url_ = url_.replace("{profileCode}", encodeURIComponent("" + profileCode));
    url_ = url_.replace(/[?&]$/, "");


    return customFetch(url_, options_, "VisualEditor_contentPagesGetByPageCode").then((_response: Response) => {

        return VisualEditor_processContentPagesGetByPageCode(_response);

    });
}


function VisualEditor_processContentPagesGetByPageCode(response: Response): Promise<any> {
    const status = response.status;
    let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
    if (status === 200) {
        return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ContentPageDetailsResponse;
            return result200;
        });
    } else if (status === 204) {
        return response.text().then((_responseText) => {
            let result204: any = null;
            result204 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("No Content(Indicates that the request is successfully executed, but the response body does not contain any data.)", status, _responseText, _headers, result204);
        });
    } else if (status === 400) {
        return response.text().then((_responseText) => {
            let result400: any = null;
            result400 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Bad Request(The request contain invalid Data.)", status, _responseText, _headers, result400);
        });
    } else if (status === 404) {
        return response.text().then((_responseText) => {
            let result404: any = null;
            result404 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Not Found. The server cannot find the requested resource.", status, _responseText, _headers, result404);
        });
    } else if (status === 500) {
        return response.text().then((_responseText) => {
            let result500: any = null;
            result500 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Server Error(Indicates that an error occurred on the server.)", status, _responseText, _headers, result500);
        });
    } else if (status !== 200 && status !== 204) {
        return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        });
    }
    return Promise.resolve<any>(null as any);


}
  
  
    
    
    

  
  
    
  

/**
        * Retrieves the preview content page details.
        * @param pageCode Page Code is used to get visual editor page details.
        * @param portalCode Portal Code is used to get visual editor page details associated with a portal.
        * @param profileCode Profile Code is used to get visual editor page details associated with a profile.
        * @return Success(Indicates that the request is successfully executed and the response body return the data in ContentPageDetailsResponse model.)
        */

export async function VisualEditor_contentPagesPreviewByPageCode(pageCode: string, portalCode: string, profileCode: string, versionNumber: number | undefined, cacheInvalidator?: FilterTuple[] | undefined): Promise<any> {


    let options_: RequestInit = {
        method: "GET",
        headers: await getHeaders("GET", String(baseUrl)),
        next: { revalidate: 0 }
    };

    let url_ = baseUrl + "v2.1/visual-editor/content-pages-preview/{pageCode}/{portalCode}/{profileCode}";

    if(versionNumber !== undefined){
        url_ += (url_.indexOf("?") === -1 ? "?" : "&") + "versionNumber=" + encodeURIComponent("" + versionNumber);
    }

    if (pageCode === undefined || pageCode === null)
        throw new Error("The parameter 'pageCode' must be defined.");
    url_ = url_.replace("{pageCode}", encodeURIComponent("" + pageCode));
    if (portalCode === undefined || portalCode === null)
        throw new Error("The parameter 'portalCode' must be defined.");
    url_ = url_.replace("{portalCode}", encodeURIComponent("" + portalCode));
    if (profileCode === undefined || profileCode === null)
        throw new Error("The parameter 'profileCode' must be defined.");
    url_ = url_.replace("{profileCode}", encodeURIComponent("" + profileCode));
    url_ = url_.replace(/[?&]$/, "");


    return customFetch(url_, options_, "VisualEditor_contentPagesPreviewByPageCode").then((_response: Response) => {

        return VisualEditor_processContentPagesPreviewByPageCode(_response);

    });
}


function VisualEditor_processContentPagesPreviewByPageCode(response: Response): Promise<any> {
    const status = response.status;
    let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
    if (status === 200) {
        return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ContentPageDetailsResponse;
            return result200;
        });
    } else if (status === 204) {
        return response.text().then((_responseText) => {
            let result204: any = null;
            result204 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("No Content(Indicates that the request is successfully executed, but the response body does not contain any data.)", status, _responseText, _headers, result204);
        });
    } else if (status === 400) {
        return response.text().then((_responseText) => {
            let result400: any = null;
            result400 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Bad Request(The request contain invalid Data.)", status, _responseText, _headers, result400);
        });
    } else if (status === 404) {
        return response.text().then((_responseText) => {
            let result404: any = null;
            result404 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Not Found. The server cannot find the requested resource.", status, _responseText, _headers, result404);
        });
    } else if (status === 500) {
        return response.text().then((_responseText) => {
            let result500: any = null;
            result500 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
            return throwException("Server Error(Indicates that an error occurred on the server.)", status, _responseText, _headers, result500);
        });
    } else if (status !== 200 && status !== 204) {
        return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        });
    }
    return Promise.resolve<any>(null as any);


}

  

    
    
    

  
  
    
  

 /**
 * Retrieves the list of pages available within a theme.
 * @param themeCode Theme Code is used to get list of pages available within a theme.
 * @return Success(Indicates that the request is successfully executed and the response body return the data in collection of ThemePageListResponse model.)
 */
 
export async function VisualEditor_themePagesByThemeCode(themeCode:string): Promise<any> {
    

        let options_: RequestInit = {
          method: "GET",
          headers: await getHeaders("GET", String(baseUrl)),
          next: { revalidate: 0 },
        };

        let url_ = baseUrl + "v2/visual-editor/themes/{themeCode}/theme-pages";
        if (themeCode === undefined || themeCode === null)
            throw new Error("The parameter 'themeCode' must be defined.");
        url_ = url_.replace("{themeCode}", encodeURIComponent("" + themeCode));
        url_ = url_.replace(/[?&]$/, "");

 
        return customFetch(url_, options_, "VisualEditor_themePagesByThemeCode").then((_response: Response) => {
       return VisualEditor_processThemePagesByThemeCode(_response);
        });
    }
   
   
  function VisualEditor_processThemePagesByThemeCode(response: Response): Promise<any> {
      const status = response.status;
       let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
    if (status === 200) {
        return response.text().then((_responseText) => {
        let result200: any = null;
        result200 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ThemePageListResponse;
        return result200;
        });
    } else if (status === 204) {
        return response.text().then((_responseText) => {
        let result204: any = null;
        result204 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
        return throwException("No Content(Indicates that the request is successfully executed, but the response body does not contain any data.)", status, _responseText, _headers, result204);
        });
    } else if (status === 400) {
        return response.text().then((_responseText) => {
        let result400: any = null;
        result400 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
        return throwException("Bad Request(The request contain invalid Data.)", status, _responseText, _headers, result400);
        });
    } else if (status === 500) {
        return response.text().then((_responseText) => {
        let result500: any = null;
        result500 = _responseText === "" ? null : JSON.parse(_responseText) as Models.ZnodeErrorDetail;
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
  