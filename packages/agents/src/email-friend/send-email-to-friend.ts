import { AREA, errorStack, logServer } from "@znode/logger/server";
import { EmailAFriendRequest, WebstoreProducts_sendMailToFriend } from "@znode/clients/v2";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { IEmailAFriendRequest, IEmailFriendResponse } from "@znode/types/email-friend";

/**
 * Send product link mail to friend.
 * @param EmailAFriendListModel
 * @returns  send mail to friend.
 */

export async function sendEmailToFriend(emailAFriend: IEmailAFriendRequest) {
  try {
    const emailRequest = convertPascalCase({
      ...emailAFriend,
    });

    const sendMail: IEmailFriendResponse = convertCamelCase(await WebstoreProducts_sendMailToFriend(emailRequest as EmailAFriendRequest));
    return sendMail;
  } catch (error) {
    logServer.error(AREA.PRODUCT, `The error occurred in the sendEmailToFriend() method in send-email-to-friend.ts file. ${errorStack(error)}`);
    return null;
  }
}
