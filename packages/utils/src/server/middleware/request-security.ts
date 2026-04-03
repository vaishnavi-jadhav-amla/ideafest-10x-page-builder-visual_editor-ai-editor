import { HEADERS } from "@znode/constants/headers";
import { NextResponse } from "next/server";

export function setResponseHeaders(response: NextResponse, isUserLoggedIn: boolean) {
  response.headers.set("content-security-policy", String(HEADERS.CONTENT_SECURITY_POLICY));
  response.headers.set("user-logged-in", String(isUserLoggedIn));
  response.cookies.set("UserLoggedInStatus", String(isUserLoggedIn));
  return response;
}