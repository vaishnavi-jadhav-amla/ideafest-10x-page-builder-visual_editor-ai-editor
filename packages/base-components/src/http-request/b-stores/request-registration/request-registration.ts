import { IBStoresRequestRegistrationModel, IBStoresRequestRegistrationResponse } from "@znode/types/b-stores/request-registration";
import { httpRequest } from "../../base";

export const submitBStoreRequestRegistration = async (bStoresRequestRegistrationBody: IBStoresRequestRegistrationModel) => {
  const response = await httpRequest<IBStoresRequestRegistrationResponse>({
    endpoint: "/api/b-stores/request-registration",
    body: { bStoresRequestRegistrationBody },
  });
  return response;
};
