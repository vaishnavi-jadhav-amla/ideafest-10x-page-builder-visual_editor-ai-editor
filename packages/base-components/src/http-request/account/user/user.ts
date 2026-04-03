import { IChangePassword, IPasswordResponse, IUser, IUserProfileResponseModel } from "@znode/types/user";
import { IResetPasswordRequest, IUserProfileRequestModel } from "@znode/types/account";

import { httpRequest } from "../../base";

export const getUserData = async () => {
  const userData = await httpRequest<IUser>({
    endpoint: "/api/account/user-information",
    method: "GET",
  });

  return userData;
};

export const editProfile = async (props: { isUserExists: boolean; editProfileRequestBody: IUserProfileRequestModel }) => {
  const response = await httpRequest<IUserProfileResponseModel>({ endpoint: "/api/account/edit-profile", body: props });
  return response;
};

export const resetPassword = async (props: IChangePassword) => {
  const getForm = await httpRequest<IChangePassword>({
    endpoint: "/api/user/reset-password",
    body: props,
  });
  return getForm;
};

export const forgotPassword = async (userModel: IResetPasswordRequest) => {
  const response = await httpRequest<IPasswordResponse>({ endpoint: "/api/user/forgot-password", body: userModel });
  return response;
};
