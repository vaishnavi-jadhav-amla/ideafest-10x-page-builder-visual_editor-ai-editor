import { AREA, errorStack, logServer } from "@znode/logger/server";
import { User_submitManageBStoreRequest } from "@znode/clients/v2";

export async function manageBStoreRequest(userId: number, storeCode: string) {
  try {
    const impersonationUrl: string = await User_submitManageBStoreRequest(userId, storeCode);

    if (!impersonationUrl || impersonationUrl.trim() === "") {
      return {
        hasError: true,
        url: null,
      };
    }

    return {
      hasError: false,
      url: impersonationUrl,
    };
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {
      hasError: true,
      url: null,
    };
  }
}
