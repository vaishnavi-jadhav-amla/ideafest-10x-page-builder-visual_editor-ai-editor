import { AREA, errorStack, logServer } from "@znode/logger/server";
import { UserModel, User_updateUserAccountData } from "@znode/clients/v1";

import { IUserProfileRequestModel } from "@znode/types/account";
import { IUserProfileResponseModel } from "@znode/types/user";
import { convertPascalCase } from "@znode/utils/server";

//Update user profile.
export async function updateProfile(isUserExists: boolean, userModel: IUserProfileRequestModel, aspNetUserId: string, userId: number) {
  try {
    const { userName } = userModel || {};
    const model = {
      ...convertPascalCase(userModel),
      UserId: userId,
      AspNetUserId: aspNetUserId,
      UserName: userName,
      IsVerified: true,
    } as UserModel;
    const editedProfile = await User_updateUserAccountData(isUserExists, model);
    const { HasError, User } = editedProfile || {};
    if(!User){
      return null;
    }
    const updatedProfile: IUserProfileResponseModel = {
      hasError: HasError as boolean,
      userDetails: {
        email: User.Email as string,
        firstName: User.FirstName as string,
        lastName: User.LastName as string,
        phoneNumber: User.PhoneNumber as string,
        emailOptIn: User.EmailOptIn as boolean,
        smsOptIn: User.SMSOptIn as boolean,
      },
    };
    return updatedProfile;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return null;
  }
}
