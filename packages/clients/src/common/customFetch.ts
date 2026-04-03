import { logServer, errorStack } from "@znode/logger/server";
import debugManager from "./debugManager";
import { CUSTOM_HEADERS } from "@znode/constants/common";

// const isInfoLogEnabled = process.env.ENABLE_INFO_LOG === "true";

export async function customFetch(input: RequestInfo, init: RequestInit, functionName: string): Promise<Response> {
  const err = new Error();
  const stack = err.stack?.split("\n") || [];
  const level0Func = functionName;

  const callerLine = stack[2] || "";
  const match = callerLine.match(/\(([^)]+)\)/);
  let fileName = "unknown";
  if (match?.[1]) fileName = match[1].split(":")[0].split("/").pop() || "unknown";

  const requestId = Math.random().toString(36).substring(2, 10);
  const url = typeof input === "string" ? input : input.url;
  const method = init?.method?.toUpperCase() || "GET";
  const headers = init?.headers || {};
  const startTime = Date.now();

  const key = method === "GET" ? `${url}|${JSON.stringify(headers)}` : ""; // dedup key
  const infoMessage = `AppName: ${process.env.APP_NAME}, Method: ${method}, ApiUrl: ${url}`;
  const shouldDebugLog = debugManager.shouldLog(level0Func);
  if (method === "GET") {
    const promise = (async () => {
      try {
        // if (isInfoLogEnabled) logServer.info(level0Func, infoMessage);
        const response = await fetch(input, init);
        const duration = Date.now() - startTime;
        const body = await response.clone().text();

        if (shouldDebugLog) {
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = body;
          }
          const details = {
            RequestHeaders: normalizeHeaders(init?.headers),
            response: { status: response.status, body: parsedBody },
            duration: `${duration}ms`,
          };

          debugManager.sendLog({
            functionName: level0Func,
            message: infoMessage + ", details: " + JSON.stringify(details || ""),
            level: "Info",
          });

          // logServer.info(level0Func, infoMessage, { request: { headers, body: init?.body }, response: { status: response.status, body: parsedBody }, duration });
        }
        return response;
      } catch (err) {
        logError(level0Func, infoMessage, err);
        throw err;
      }
    })();

    return promise;
  }

  // For non-GET requests, proceed normally
  try {
    // if (isInfoLogEnabled) logServer.info(level0Func, infoMessage);
    const response = await fetch(input, init);
    const duration = Date.now() - startTime;
    const body = await response.clone().text();

    if (shouldDebugLog) {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
      const details = {
        request: {  RequestHeaders: normalizeHeaders(init?.headers), body: typeof init?.body === "string" ? JSON.parse(init?.body || "{}") : init?.body },
        response: { status: response.status, body: parsedBody },
        duration: `${duration}ms`,
      };
      debugManager.sendLog({
        functionName: level0Func,
        message: infoMessage + ", details: " + JSON.stringify(details || ""),
        level: "Info",
      });
    }

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logError(level0Func, infoMessage, error);
    throw error;
  }
}

function logError(level0Func: string, infoMessage: string, error: any) {
  logServer.error(level0Func, infoMessage + "Error: " + errorStack(error));
}


function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};

  let normalized: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      if (key.toLowerCase() !== "authorization") {
        normalized[key] = value;
      }
    });
  } else if (Array.isArray(headers)) {
    normalized = Object.fromEntries(
      headers.filter(([key]) => key.toLowerCase() !== CUSTOM_HEADERS.AUTHORIZATION.toLowerCase())
    );
  } else {
    // Plain object
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== CUSTOM_HEADERS.AUTHORIZATION.toLowerCase()) {
        normalized[key] = value;
      }
    });
  }
  return normalized;
}
