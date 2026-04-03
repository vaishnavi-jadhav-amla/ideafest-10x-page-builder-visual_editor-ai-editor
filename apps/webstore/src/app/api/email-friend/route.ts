import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { sendEmailToFriend } from "@znode/agents/email-friend/send-email-to-friend";
import { IEmailFriendResponse } from "@znode/types/email-friend";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const portalHeader = await getPortalHeader();

    const payload = {
      ...requestData,
      localeCode: portalHeader.localeCode,
      catalogCode: portalHeader.publishCatalogCode,
      storeCode: portalHeader.storeCode,
    };

    const email: IEmailFriendResponse | null = await sendEmailToFriend(payload);
    if (email?.isSuccess) {
      return sendSuccess(email, "Email sent to friend successfully.");
    } else {
      return sendError("An error occurred while sending email: " + email?.errorMessage || "", 500);
    }
  } catch (error) {
    return sendError("An error occurred while sending email: " + String(error), 500);
  }
}
