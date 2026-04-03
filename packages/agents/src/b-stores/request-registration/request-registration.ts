import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IBStoresRequestRegistrationModel } from "@znode/types/b-stores/request-registration";
import { User_submitBStoreRequest } from "@znode/clients/v1";
import { convertPascalCase } from "@znode/utils/server";

interface RegisterBStoreResponse {
  hasError: boolean;
  isSuccess: boolean;
  errorMessage?: string;
}

export async function registerBStoreRequest(bStoresRequestRegistrationBody: IBStoresRequestRegistrationModel): Promise<RegisterBStoreResponse> {
  try {
    const registrationResponse = await User_submitBStoreRequest(convertPascalCase(bStoresRequestRegistrationBody));
    const { HasError, IsSuccess } = registrationResponse ?? {};

    return {
      hasError: Boolean(HasError),
      isSuccess: Boolean(IsSuccess),
    };
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));

    return {
      hasError: true,
      isSuccess: false,
      errorMessage: "Failed to register B-Store request",
    };
  }
}
