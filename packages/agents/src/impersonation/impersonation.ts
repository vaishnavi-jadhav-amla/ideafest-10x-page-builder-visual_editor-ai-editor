import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Users_userAccountDataByUsername, Users_usersByUsername, Users_validateCsrToken } from "@znode/clients/v2";

import { IImpersonation } from "@znode/types/impersonation";
import { convertCamelCase } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";

export async function checkExistingUserSession(token: string, storeCode?: string) {
  try {
    const currentUser = await getSavedUserSession();
    const userDetails = (await performImpersonation(token, storeCode ?? ""))?.userModel;
    if (currentUser === null || currentUser === undefined) {
      return { isUserLoggedIn: false, sameUserFlag: false };
    }
    if (currentUser.userId === userDetails?.userId) {
      return { isUserLoggedIn: false, sameUserFlag: true };
    }
    return { isUserLoggedIn: true, sameUserFlag: false };
  } catch (error) {
    logServer.error(AREA.IMPERSONATION, errorStack(error));
    return { isUserLoggedIn: false, sameUserFlag: false };
  }
}

async function performImpersonation(token: string, storeCode: string) {
  try {
    const requestModel = {
      Token: token,
    };
    const impersonation = (await Users_validateCsrToken(requestModel))?.ImpersonationModel;
    const impersonationData = convertCamelCase(impersonation);
    if (impersonationData !== null || (impersonationData !== undefined && impersonationData.result)) {
      return await getUserDetails(impersonationData, storeCode);
    } else {
      return null;
    }
  } catch (error) {
    logServer.error(AREA.IMPERSONATION, errorStack(error));
    return null;
  }
}

export async function impersonationLogin(token: string, storeCode: string) {
  try {
    const { userModel, impersonationModel } = (await performImpersonation(token, storeCode)) || {};
    if ((impersonationModel && userModel && userModel !== null) || userModel !== undefined) {
      const crsUserModel = await Users_userAccountDataByUsername(impersonationModel?.adminUserName || "", storeCode);
      userModel.crsName = crsUserModel ? crsUserModel?.FirstName + " " + crsUserModel?.LastName : "";
      userModel.crsUserId = impersonationModel?.crsUserId ?? null;
      return userModel;
    } else return null;
  } catch (error) {
    logServer.error(AREA.IMPERSONATION, errorStack(error));
    return null;
  }
}

async function getUserDetails(impersonation: IImpersonation, storeCode: string) {
  try {
    const userData = await Users_usersByUsername(impersonation.userName || "", storeCode);
    const userDetails = convertCamelCase(userData);
    if (userDetails) {
      userDetails.userName = impersonation.userName;
      userDetails.isWebstoreUser = true;
      impersonation.shopperName = userDetails.firstName + " " + userDetails.lastName;
      impersonation.storeCode = storeCode;
      return {
        userModel: userDetails,
        impersonationModel: impersonation,
      };
    }
    return null;
  } catch (error) {
    logServer.error(AREA.IMPERSONATION, errorStack(error));
    return null;
  }
}
