
import { IChangePassword } from "@znode/types/user";
import { httpRequest } from "../../base";
import { ResetPasswordStatusEnum } from "@znode/types/enums";

export const getResetPasswordStatus = async (resetPasswordData: IChangePassword) => {
  const response = await httpRequest<ResetPasswordStatusEnum>({
    endpoint: "/api/account/confirm-reset-password-status",
    body: resetPasswordData,
  });
  return response;
};
