import { httpRequest } from "../../base";
import { IBStoresUserRoleResponseModel } from "@znode/types/b-stores/user-role-response";

export const getUserBStoreRoleAccess = async () => {
  const response = await httpRequest<IBStoresUserRoleResponseModel>({
    endpoint: "/api/b-stores/user-role-access",
  });
  return response;
};
