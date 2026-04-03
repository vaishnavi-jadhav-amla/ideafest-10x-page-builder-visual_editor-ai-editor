import { IUser } from "@znode/types/user";

export const mappedGuestUser = (user: IUser) => {
  return { userId: user.userId, email: user.email };
};
