import { IEmailAFriendRequest, IEmailFriendResponse } from "@znode/types/email-friend";

import { httpRequest } from "../base";

export const sendEmailToFriend = async (props: IEmailAFriendRequest) => {
  const emailToFriend = await httpRequest<IEmailFriendResponse>({
    endpoint: "/api/email-friend",
    method: "POST",
    body: props
  });
  return emailToFriend;
};