import { IUserSignUp } from "@znode/types/user";
import { httpRequest } from "../base";

export const getUserSettings = async () => {
  const userSettings = await httpRequest<IUserSignUp>({ endpoint: "/api/common/user-settings" });
  return userSettings;
};
