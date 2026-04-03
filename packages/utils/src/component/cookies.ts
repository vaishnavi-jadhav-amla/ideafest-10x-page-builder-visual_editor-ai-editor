import Cookies from "js-cookie";

/**
 * Read cookie
 */
export const getCookie = (name: string) => {
  return Cookies.get(name);
};

/**
 * Checks if cookie is present
 */
export const hasCookie = (name: string) => {
  if (Cookies.get(name) != null || undefined) return true;
  return false;
};

/**
 * Read all available cookies
 */
export const getAllCookies = () => {
  return Cookies.get();
};

/**
 * Create a cookie
 */
// eslint-disable-next-line max-len
export const setCookie = (name: string, value: string, cookieExpireInMinutes?: number, cookieAttributes?: ICookieAttributes) => {
  const options: ICookieAttributes = {
    expires: cookieExpireInMinutes ? new Date(Date.now() + cookieExpireInMinutes * 60 * 1000) : undefined,
  };
  cookieAttributes = { ...options };

  if (Object.keys(cookieAttributes).length === 0) {
    cookieAttributes = undefined;
  } else if (Object.values(cookieAttributes).every((value) => value === undefined)) {
    cookieAttributes = undefined;
  }
  Cookies.set(name, value, cookieAttributes);
};

/**
 * Delete cookie
 */
export const deleteCookie = (name: string, isCookieHttpOnly?: boolean, isCookieSecure?: boolean) => {
  const options: ICookieAttributes = {
    httpOnly: isCookieHttpOnly,
    secure: isCookieSecure,
  };
  Cookies.remove(name, options);
};

export const getCookieRuntime = (name: string) => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    const cookie = cookieStore.get(name);
    if (cookie !== undefined) return cookie.value;
  } else {
    return getCookie(name);
  }
};

// Pass maxAge args in seconds
export const setCookieRuntime = (name: string, value: string, maxAge?: number) => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    cookieStore.set(name, value, { maxAge: maxAge || 1500 });
  }
};
export const deleteCookieRuntime = (name: string) => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    cookieStore.delete(name);
  } else {
    Cookies.remove(name);
  }
};

export const getHeaderRuntime = (name: string) => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers } = require("next/headers");
    const headerList = headers();
    const header = headerList.get(name);
    if (header !== undefined) return header;
  } else {
    return getCookie(name);
  }
};

export interface ICookieAttributes {
  expires?: Date | undefined; //Define when the cookie will be removed. Value can be a Date instance. If omitted, the cookie becomes a session cooki
  path?: string | undefined; //Define the path where the cookie is available. Defaults to '/'
  domain?: string | undefined; //Define the domain where the cookie is available. Defaults to the domain of the page where the cookie was created
  secure?: boolean | undefined; //A Boolean indicating if the cookie transmission requires a secure protocol (https). Defaults to false
  sameSite?: "strict" | "Strict" | "lax" | "Lax" | "none" | "None" | undefined; //Asserts that a cookie must not be sent with cross-origin requests
  httpOnly?: boolean | undefined; // If cookie must be set from server side
}

export function signInCleanUpFunction() {
  deleteCookieRuntime("userDetails");
}

export default getCookie;
