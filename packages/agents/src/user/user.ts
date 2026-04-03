import { AREA, errorStack, logServer } from "@znode/logger/server";
import {
  ChangePasswordRequestModel,
  CreateUserRequest,
  LoginRequestModel,
  ResetPasswordLinkRequest,
  Users_changePassword,
  Users_forgotPassword,
  Users_users,
  Users_usersByUsername,
  Users_verifyResetPasswordLink,
  GenerateMultiFactorOtpRequest,
  Users_V2_1_login,
  ValidateMultiFactorOtpRequest,
  MultiFactorAuthentication_validate,
  MultiFactorAuthentication_otpsPost,
  MultiFactorAuthentication_otpsGetByUserId,
} from "@znode/clients/v2";
import { GlobalAttributeEntity_getGlobalEntityAttributes, IChangePassword, WebStoreAccount_createAccountAddress } from "@znode/clients/v1";
import { IAnonymousUserAddressRequest, IAnonymousUserAddressResponse, IResetPasswordStatusResponse, IMultiFactorAuthenticationResponse } from "@znode/types/user";
import { ILoginUser, IRegisterUserRequest, IUser, IUserDetailResponse } from "@znode/types/user";
import { IPortalDetail, IPortalFeatureValues } from "@znode/types/portal";
import { ResetPasswordStatusEnum, UserVerificationTypeEnum } from "@znode/types/enums";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { ACCOUNT } from "@znode/constants/account";
import { ADDRESS } from "@znode/constants/address";
import { ERROR_CODE } from "@znode/constants/error";
import { IAddress } from "@znode/types/address";
import { IGlobalAttributeGroupModel } from "@znode/types/attribute";
import { IResetPasswordRequest } from "@znode/types/account";
import { getStoreCatalogId } from "../category";
import { mappedGuestUser } from "./mapper";
import { encryptData, getCookieRuntime, setCookieRuntime, signInCleanUpFunction, uuidv4 } from "@znode/utils/component";
import { parseBrowser, parseOS } from "@znode/utils/common";
import { COMMON } from "@znode/constants/common";

/**
 * Verify Reset Password Link Status.
 * @param passwordToken,userName
 * @returns error code.
 */
export async function verifyResetPasswordLinkStatus(passwordToken: string, userName: string, portalId: number) {
  try {
    if (userName && passwordToken) {
      const userModel: ResetPasswordLinkRequest = {
        User: {
          UserName: userName,
          PasswordToken: passwordToken,
        },
        PortalId: portalId,
      };
      const verifyLinkStatus = convertCamelCase((await Users_verifyResetPasswordLink(userModel)) as IResetPasswordStatusResponse);
      const statusCode = verifyLinkStatus.hasError ? verifyLinkStatus.errorCode : verifyLinkStatus.statusCode;

      let result;
      switch (statusCode) {
        case ERROR_CODE.RESET_PASSWORD_CONTINUE:
          result = ResetPasswordStatusEnum.Continue;
          break;
        case ERROR_CODE.RESET_PASSWORD_LINK_EXPIRED:
          result = ResetPasswordStatusEnum.LinkExpired;
          break;
        case ERROR_CODE.RESET_PASSWORD_TOKEN_MISMATCH:
          result = ResetPasswordStatusEnum.TokenMismatch;
          break;
        case ERROR_CODE.RESET_PASSWORD_NO_RECORD:
          result = ResetPasswordStatusEnum.NoRecord;
          break;
        default:
          result = ResetPasswordStatusEnum.NoRecord;
      }
      return result;
    }
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return 0;
  }
}

/**
 * Confirm Reset Password Link Status.
 * @param passwordToken,userName
 * @returns status.
 */
export async function confirmResetPasswordLinkStatus(passwordToken: string, userName: string, portalId: number) {
  try {
    const model: IChangePassword = {
      UserName: userName,
      PasswordToken: passwordToken,
      IsResetPassword: true,
    };
    const enumStatus = await verifyResetPasswordLinkStatus(passwordToken, userName, portalId);
    switch (enumStatus) {
      case ResetPasswordStatusEnum.Continue:
        return model;
      case ResetPasswordStatusEnum.LinkExpired:
        return enumStatus;

      case ResetPasswordStatusEnum.TokenMismatch:
        return enumStatus;

      case ResetPasswordStatusEnum.NoRecord:
        return enumStatus;

      default:
        return enumStatus;
    }
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {};
  }
}

/**
 * Reset Password.
 * @param IChangePassword
 * @returns changePassword.
 */
export async function resetPassword(changePasswordModel: IResetPasswordRequest, storeCode: string): Promise<{ hasError: boolean; errorMessage: string }> {
  try {
    const { newPassword, userName, currentPassword, passwordToken } = changePasswordModel;
    const userModel: ChangePasswordRequestModel = {
      User: {
        NewPassword: newPassword,
        UserName: userName,
        Password: currentPassword,
        PasswordToken: passwordToken,
      },

      StoreCode: storeCode || "",
    };

    const resetResponse = await Users_changePassword(userModel);

    const hasError = resetResponse?.HasError ?? true;
    const errorMessage = resetResponse?.ErrorMessage || "Unable to reset password";
    return { hasError, errorMessage };
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return { hasError: true, errorMessage: "An error occurred while resetting the password." };
  }
}

export async function forgotPassword(userData: IResetPasswordRequest, storeCode: string): Promise<{ hasError: boolean } | null> {
  try {
    if (userData) {
      const userDetails = await Users_usersByUsername(userData.userName, storeCode as string);
      if (userDetails) {
        const { UserId: userId } = userDetails || {};
        const { userName, baseUrl } = userData;
        if (userId) {
          const userModel = {
            UserName: userName,
            StoreCode: storeCode,
            BaseUrl: baseUrl,
            AppType: process.env.APP_NAME,
          };
          const forgotResponse = await Users_forgotPassword(userModel);
          const { HasError } = forgotResponse || {};
          return { hasError: HasError ?? true };
        }
      }
    }
    return null;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return null;
  }
}

const getExistingUserMultiStoreError = (errorMessage: string, baseUrl: string) => {
  const storeNameAndURLArray = errorMessage?.match(/Store Name:\s*(.*?)\s*and Domain Url:\s*(https?:\/\/[^\s.]+(?:\.[^\s.]+)+(?:\/\S*)?)/) || [];
  if (storeNameAndURLArray && storeNameAndURLArray.length > 1) {
    const defaultStoreName = storeNameAndURLArray[1];
    const forgotPasswordUrl = `${baseUrl}/forgot-password`;
    return { defaultStoreName, forgotPasswordUrl };
  }
  return { defaultStoreName: "", forgotPasswordUrl: "" };
};

//Get the client response for new register user.
export async function signUp(registerUser: IRegisterUserRequest, currentPortal: IPortalDetail) {
  try {
    const userModel = {
      portalId: currentPortal?.portalId,
      localeId: currentPortal?.localeId,
      isWebStoreUser: true,
      emailOptIn: registerUser.emailOptIn,
      userVerificationTypeCode: currentPortal?.userVerificationTypeCode,
      user: {
        username: registerUser.userName,
        password: registerUser.password,
        email: registerUser.userName,
      },
      baseUrl: registerUser.baseUrl,
      storeCodes: [currentPortal?.storeCode || ""],
    };

    const newUser: IUserDetailResponse = (await Users_users(userModel as CreateUserRequest)) as IUserDetailResponse;
    const formattedNewUser = convertCamelCase(newUser);
    if (formattedNewUser.errorCode === 409) {
      const errorDetails = getExistingUserMultiStoreError(formattedNewUser?.errorMessage || "", registerUser.baseUrl);
      formattedNewUser.errorDetails = errorDetails;
    }
    return formattedNewUser;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return null;
  }
}

/**
 * Register new user.
 * @param IRegisterUser
 * @returns register User.
 */
export async function registerNewUser(registerUser: IRegisterUserRequest, { localeId, portalId, userVerificationTypeCode, publishCatalogId }: IPortalDetail): Promise<ILoginUser> {
  try {
    const newUser = await signUp(registerUser, {
      localeId,
      portalId,
      userVerificationTypeCode,
      publishCatalogId,
    });
    if (newUser) {
      if (newUser?.userVerificationType === UserVerificationTypeEnum[UserVerificationTypeEnum.AdminApprovalCode]) {
        newUser.hasApproval = true;
        return convertCamelCase(newUser);
      }

      if (newUser?.userVerificationType === UserVerificationTypeEnum[UserVerificationTypeEnum.EmailVerificationCode]) {
        newUser.errorCode = ERROR_CODE.EMAIL_VERIFICATION;
        return convertCamelCase(newUser);
      }
      return convertCamelCase(newUser);
    }
    return convertCamelCase(newUser);
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {
      user: null,
      errorMessage: "Something went wrong. Please try again later.",
    };
  }
}

export async function getUserCatalogId(
  publishCatalogId: number | undefined,
  portalProfileCatalogId?: number,
  profileId?: number,
  portalFeatureValues?: IPortalFeatureValues,
  userDetails?: IUser
) {
  const currentUser = userDetails;
  if (((await getUserProfileId(currentUser, profileId, portalFeatureValues)) || 0) > 0) {
    return await getProfilePublishCatalogId(currentUser, publishCatalogId);
  } else if (currentUser && (currentUser?.accountId ?? 0) > 0 && (currentUser?.publishCatalogId ?? 0) > 0) {
    return currentUser.publishCatalogId;
  } else if (!currentUser) {
    return await getStoreCatalogId(profileId, publishCatalogId, portalProfileCatalogId);
  } else return publishCatalogId;
}

export async function getUserProfileId(currentUser: IUser | undefined, profileId?: number, portalFeatureValues?: IPortalFeatureValues) {
  const portalFeatureValue = portalFeatureValues?.enableProfileBasedSearch;

  if (portalFeatureValue) {
    if (currentUser) {
      if ((currentUser?.profiles?.length || 0) > 0) {
        if (currentUser?.profileId && currentUser?.profileId > 0) return currentUser.profileId;
        else {
          const defaultProfile = currentUser?.profiles?.at(0)?.profileId;
          return defaultProfile;
        }
      } else {
        return profileId;
      }
    }
  }
  return null;
}

export async function getProfilePublishCatalogId(currentUser: IUser | undefined, publishCatalogId?: number) {
  const catalogId = currentUser?.profiles?.find((profile) => profile.isDefault)?.publishCatalogId || 0;
  if (catalogId > 0) return catalogId;
  else return publishCatalogId;
}

/** Get user global attributes */
export async function getUserGlobalAttributes(userId: number) {
  if (userId > 0) {
    const userGlobalAttributes = await GlobalAttributeEntity_getGlobalEntityAttributes(userId, ACCOUNT.USER, [], [], {}, 0, 0);
    const globalAttributeGroupModel: IGlobalAttributeGroupModel[] = userGlobalAttributes?.EntityDetails?.Groups;
    return globalAttributeGroupModel;
  }
}

/** Create user when guest user placing order */

export async function createAnonymousUserAccounts(shippingAddress: IAddress | undefined, emailAddress: string | undefined, profileId: number, portalId: number, baseUrl: string) {
  const requestAccountData = {
    firstName: shippingAddress?.firstName,
    lastName: shippingAddress?.lastName,
    isGuestUser: true,
    user: {
      email: emailAddress,
      username: emailAddress,
      password: null,
    },
    portalId: portalId,
    profileId: profileId,
    baseUrl: baseUrl,
  };

  const newUser = await Users_users(convertPascalCase(requestAccountData));
  const newUserResponse = convertCamelCase(newUser);
  newUserResponse.email = emailAddress;
  return mappedGuestUser(newUserResponse);
}

export async function createAnonymousUserAddress(addressModel: IAddress) {
  if (addressModel) {
    const webStoreAccountData = await WebStoreAccount_createAccountAddress(convertPascalCase(addressModel));
    const webStoreAccountResponse = convertCamelCase(webStoreAccountData);
    if (webStoreAccountResponse) {
      addressModel = webStoreAccountResponse.accountAddress;
      if (!addressModel.hasError) addressModel.successMessage = ADDRESS.SUCCESS_ADDRESS_ADDED;
    } else return null;
    return addressModel;
  } else return null;
}

export async function createAnonymousUserAddressId(addressRequest: IAnonymousUserAddressRequest) {
  try {
    if (addressRequest?.isBothBillingShipping && addressRequest.address) {
      const address = await createAnonymousUserAddress(addressRequest.address);
      if (address) {
        const userAddressResponse: IAnonymousUserAddressResponse = {
          shippingAddressId: address.addressId,
          billingAddressId: address.addressId,
          billingAddress: address,
          hasError: address?.addressId ? false : true,
        };
        return userAddressResponse;
      }
    } else if (addressRequest?.isBothBillingShipping === false) {
      if (addressRequest?.shippingAddress) {
        const shippingAddressResponse = await createAnonymousUserAddress(addressRequest.shippingAddress);
        if (shippingAddressResponse) {
          const userAddressResponse: IAnonymousUserAddressResponse = {
            shippingAddressId: shippingAddressResponse.addressId,
            hasError: shippingAddressResponse.addressId ? false : true,
          };
          return userAddressResponse;
        }
      } else if (addressRequest?.billingAddress) {
        const billingAddressResponse = await createAnonymousUserAddress(addressRequest.billingAddress);
        if (billingAddressResponse) {
          const userAddressResponse: IAnonymousUserAddressResponse = {
            billingAddressId: billingAddressResponse.addressId,
            hasError: billingAddressResponse.addressId ? false : true,
          };
          return userAddressResponse;
        }
      }
    }
    return { hasError: true } as IAnonymousUserAddressResponse;
  } catch (error) {
    logServer.error(AREA.PORTAL, errorStack(error));
    return { hasError: true } as IAnonymousUserAddressResponse;
  }
}

export async function validateOneTimePassword(props: ValidateMultiFactorOtpRequest, userAgent: string) {
  const updatedPayload = { ...props };
  let deviceId = getCookieRuntime("Device-Id") || "";

  if (userAgent) {
    const browserName = parseBrowser(userAgent);
    const platformName = parseOS(userAgent);
    if (!deviceId) {
      const id = uuidv4();
      deviceId = `${browserName}-${platformName}-${id}`;
      setCookieRuntime("Device-Id", deviceId, 200000); //55hrs cookie expiration time
    }
  }
  const response = await MultiFactorAuthentication_validate(updatedPayload, userAgent, deviceId);
  const formattedResponse = convertCamelCase(response);
  if (formattedResponse?.isValid) {
    signInCleanUpFunction();
  }
  return formattedResponse;
}

export async function generateOneTimePassword(props: GenerateMultiFactorOtpRequest, userAgent: string) {
  let deviceId = getCookieRuntime("Device-Id") || "";
  if (!deviceId && userAgent) {
    const browserName = parseBrowser(userAgent);
    const platformName = parseOS(userAgent);
    const id = uuidv4();
    deviceId = `${browserName}-${platformName}-${id}`;
    setCookieRuntime("Device-Id", deviceId, 200000); //55hrs cookie expiration time
  }
  const response = await MultiFactorAuthentication_otpsPost(props, userAgent, deviceId);
  const formattedResponse = convertCamelCase(response);
  return formattedResponse;
}

export async function getOTPDetails(userId: number, userAgent: string, websiteLogoLink: string, storeCode: string, enableCartRedirection: boolean) {
  if (!userId) return {};
  let deviceId = getCookieRuntime("Device-Id") || "";
  if (!deviceId && userAgent) {
    const browserName = parseBrowser(userAgent);
    const platformName = parseOS(userAgent);
    const id = uuidv4();
    deviceId = `${browserName}-${platformName}-${id}`;
    setCookieRuntime("Device-Id", deviceId, 200000); //55hrs cookie expiration time
  }

  const response = await MultiFactorAuthentication_otpsGetByUserId(userId, undefined, userAgent, deviceId);
  const formattedResponse: IMultiFactorAuthenticationResponse = convertCamelCase(response);
  const expireTime = formattedResponse?.otpExpirationTime ? new Date(formattedResponse.otpExpirationTime).getTime() : new Date().getTime();
  const currentTime = new Date().getTime();
  const remainingSeconds = Math.floor((expireTime - currentTime) / 1000) || 0;
  formattedResponse.remainingSeconds = remainingSeconds >= 0 ? remainingSeconds : 0;
  formattedResponse.logoUrl = websiteLogoLink;
  formattedResponse.storeCode = storeCode;
  formattedResponse.enableCartRedirection = enableCartRedirection;

  return formattedResponse;
}

export async function loginUser(props: LoginRequestModel, userAgent: string) {
  let deviceId = getCookieRuntime("Device-Id") || "";
  if (!deviceId) {
    const browserName = parseBrowser(userAgent);
    const platformName = parseOS(userAgent);
    const id = uuidv4();
    deviceId = `${browserName}-${platformName}-${id}`;
    setCookieRuntime("Device-Id", deviceId, 200000); //55hrs cookie expiration time
  }

  const response = await Users_V2_1_login(props, userAgent, deviceId);
  const formattedResponse = convertCamelCase(response);
  if (!formattedResponse.hasError) {
    if (formattedResponse.isMultiFactorAuthenticationEnabled) {
      const encryptedUsername = await encryptData(props?.User?.Username + "");
      const encryptedPassword = await encryptData(props?.User?.Password + "");
      const encryptedUserId = await encryptData(formattedResponse.userId + "");
      const encryptedUserDetails = `${encryptedUsername}${COMMON.ZNODE_USER_DETAILS_SALT}${encryptedUserId}${COMMON.ZNODE_USER_DETAILS_SALT}${encryptedPassword}`;
      setCookieRuntime("userDetails", encryptedUserDetails, 1200);
      return { isMultiFactorAuthenticationEnabled: true };
    } else {
      return { ...formattedResponse, isMultiFactorAuthenticationEnabled: false };
    }
  }
  return formattedResponse;
}
