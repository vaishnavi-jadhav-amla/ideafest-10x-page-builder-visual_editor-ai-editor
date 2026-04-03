/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-console */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestParams {
  endpoint: string;
  method?: HttpMethod;
  body?: Record<string, any>;
  queryParams?: Record<string, any>;
  signal?: AbortSignal;
  contentType?: "json" | "form-data"; // default to "json"
}

export async function httpRequest<T>({ endpoint, method, body, queryParams, signal, contentType = "json" }: ApiRequestParams): Promise<T> {
  let url = endpoint;
  try {
    // Append query parameters if provided
    if (queryParams) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
    }

    const options: RequestInit = {
      method: method || (body ? "POST" : "GET"), // Default to POST if body exists, otherwise GET,

      cache: "no-store",
      ...(signal && { signal }),
    };

    if (contentType === "json") {
      options.headers = {
        "Content-Type": "application/json",
      };
      if (method !== "GET" && body) {
        options.body = JSON.stringify(body);
      }
    } else if (contentType === "form-data") {
      options.body = body as FormData;
    }

    const response = await fetch(url, options);
    const isMaintenance = response.headers.get("x-maintenance-mode");
    if (isMaintenance) {
      window.location.reload();
    }
    const jsonResponse = await response.json();
    //Error Handling based on response status
    //TODO

    return jsonResponse.data;
  } catch (error: any) {
    console.error("Error occurred during API request:", error);
    return {
      hasError: true,
      errorMessage: "Error occurred: " + error.message,
    } as any;
  }
}

//Sample usage

/*
export const getCategoryList = async (props: any) => {
    const categoryList = await httpRequest<ISeoDetails>({endpoint : "/category", queryParams : props});
    return categoryList;
  };
*/

//Method type if not added would be defaulted to POST if body param is present, else as GET
//Add return type of the method according to the requested type
