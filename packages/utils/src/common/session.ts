"use server";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IUser } from "@znode/types/user";
import { authLoginOptions } from "../server/authentication/auth";
import { getSession as getClientSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { stringToBooleanV2 } from "./string-to-boolean";

/**
 * @param shouldRefresh - Optional parameter to force fetching the session from the server
 * @returns session user from server on both client and server
 */
export async function getSavedUserSession(shouldRefresh?: boolean): Promise<IUser | null> {
  try {
    const userLoggedIn = headers().get("user-logged-in");
    let session = null;
    if (stringToBooleanV2(userLoggedIn)) {
      const isServer = typeof window === "undefined";
      session = isServer || shouldRefresh ? await getServerSession(authLoginOptions) : await getClientSession();
      return session?.user as IUser;
    } else {
      return session;
    }
  } catch (error) {
    logServer.error(AREA.SESSION_HELPER, errorStack(error));
    return null;
  }
}

export default getSavedUserSession;
