import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Users_validateLoginToken, GenerateTokenRequestModel } from "@znode/clients/v2";
import { getSavedUserSession } from "@znode/utils/common";
import { convertCamelCase } from "@znode/utils/server";
import { getApiHeaders } from "packages/clients/src/znode-client/V2/base";
import { APP } from "@znode/constants/app";
import { HEADERS } from "@znode/constants/headers";

export async function checkExistingUserSession(token: string) {
  try {
    const currentUser = await getSavedUserSession();
    const userDetails = await validateSingleSignInToken(token);
    if (currentUser === null || currentUser === undefined || currentUser.userId === userDetails) {
      return false;
    }
    return true;
  } catch (error) {
    logServer.error(AREA.SINGLE_SIGN_IN, errorStack(error));
    return false;
  }
}

export async function validateSingleSignInToken(token: string) {
  try {
    const userBody = {
      Token: token,
    };
    const signInUserDetails = await Users_validateLoginToken(userBody);
    return signInUserDetails;
  } catch (error) {
    logServer.error(AREA.SINGLE_SIGN_IN, errorStack(error));
    return { HasError: true };
  }
}

export async function getSingleSignInUserToken(username: string, password: string, storeCode: string, clientSecretKey: string) {
  try {
    const userBody = {
      Password: password,
      StoreCode: storeCode,
    };
    const signUpToken = await userLoginToken(username, userBody, clientSecretKey);
    return convertCamelCase(signUpToken);
  } catch (error) {
    logServer.error(AREA.SINGLE_SIGN_IN, errorStack(error));
    return { HasError: true };
  }
}

export async function userLoginToken(userName: string, body: GenerateTokenRequestModel | undefined, clientSecretKey: string) {
  let headers: HeadersInit = await getApiHeaders("POST", false);
  headers = new Headers(headers);
  headers.set(HEADERS.CLIENT_SECRET, clientSecretKey);
  try {
    const baseUrl = APP.BASE_URL;

    const url = `${baseUrl}v2/users/login-token/${encodeURIComponent(userName)}`;

    const res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error) {
    logServer.error("Error during user login token fetch:", errorStack(error));
    return { HasError: true };
  }
}
