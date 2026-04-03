import { sendError, sendSuccess } from "@znode/utils/server";

import { IUserProfileRequestModel } from "@znode/types/account";
import { getSavedUserSession } from "@znode/utils/common";
import { updateProfile } from "@znode/agents/account";

export async function POST(request: Request) {
  try {
    const requestObject = await request.json();
    const { isUserExists, editProfileRequestBody } : { isUserExists: boolean; editProfileRequestBody: IUserProfileRequestModel } = requestObject || {};
    const userSession = await getSavedUserSession();
    const { userId , aspNetUserId } = userSession || {};
    if (userId && aspNetUserId) {
      const userDetails = await updateProfile(isUserExists, editProfileRequestBody , aspNetUserId , userId);
      return sendSuccess(userDetails, "Profile updated successfully");
    } else {
      return sendError(`Invalid User ID ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while updating the profile " + String(error), 500);
  }
}
