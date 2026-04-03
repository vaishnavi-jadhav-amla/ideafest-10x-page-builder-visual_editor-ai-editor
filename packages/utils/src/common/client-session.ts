"use client";

import { IUser } from "@znode/types/user";
import { getCookie } from "../component";
import { getSession } from "next-auth/react";
import { stringToBooleanV2 } from "./string-to-boolean";

let sessionPromise: Promise<IUser | null> | null = null;
let cachedSession: IUser | null = null;

export async function getSavedUserSessionCallForClient(shouldRefresh?: boolean): Promise<IUser | null> {
  if (shouldRefresh) {
    sessionPromise = null;
    cachedSession = null;
  }
  if (shouldRefresh) {
    cachedSession = null;
  }
  if (cachedSession !== null) {
    return cachedSession;
  }

  if (sessionPromise) {
    return sessionPromise;
  }


  const fetchSession = async (): Promise<IUser | null> => {
    try {
      const isUserLoggedIn = getCookie("UserLoggedInStatus");
      if (!stringToBooleanV2(isUserLoggedIn)) {
        return null;
      }

      const session = await getSession();
      if (session?.user) {
        cachedSession = session.user as IUser;
        return cachedSession;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  sessionPromise = fetchSession().then((data) => {
    if (!data) {
      sessionPromise = null;
    }
    return data;
  });

  return sessionPromise;
}

export default getSavedUserSessionCallForClient;
