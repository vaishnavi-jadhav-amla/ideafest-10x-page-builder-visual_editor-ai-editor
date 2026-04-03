import { AREA, errorStack, logServer } from "@znode/logger/server";
import { User_getBStoreRoleAccess } from "@znode/clients/v1";
import { IBStoresUserRoleResponseModel } from "@znode/types/b-stores/user-role-response";
import { convertCamelCase } from "@znode/utils/server";

export async function getUserBStoreRoleAccess(userId: string): Promise<IBStoresUserRoleResponseModel | null> {
  try {
    const roleAccessResponse = await User_getBStoreRoleAccess(userId);
    const roleAccessConverted = convertCamelCase(roleAccessResponse);
    const { HasError, ErrorMessage } = roleAccessConverted ?? {};

    return {
      ...roleAccessConverted,
      hasError: Boolean(HasError),
      errorMessage: ErrorMessage || "",
    };
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));

    return {
      hasError: true,
      errorMessage: "Failed to fetch user role access",
    };
  }
}
