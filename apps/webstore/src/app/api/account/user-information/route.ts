import { sendError, sendSuccess } from "@znode/utils/server";

import { getSavedUserSession } from "@znode/utils/common";

export async function GET() {
  try {
    const userSession = await getSavedUserSession();
    const userId = userSession?.userId;
    if (userId) {
      const response = {
        fullName: userSession.fullName,
        userName: userSession.userName,
        email: userSession.email,
        firstName: userSession.firstName,
        lastName: userSession.lastName,
        phoneNumber: userSession.phoneNumber,
        emailOptIn: userSession.emailOptIn,
        smsOptIn: userSession.smsOptIn,
      };
      return sendSuccess(response, "User information retrieved successfully");
    } else {
      return sendError(`Invalid User ID ${userId}.`, 403);
    }
  } catch (error) {
    return sendError("An error occurred while fetching user profile " + String(error), 500);
  }
}
