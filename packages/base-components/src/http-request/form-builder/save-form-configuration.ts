import { httpRequest } from "../base";

import { ISaveFormConfigurationResponse, ISaveConfigurationRequest } from "@znode/types/form-builder/save-form-configuration";

export async function saveFormConfigurationAPI(request: ISaveConfigurationRequest) {
  const response = await httpRequest<ISaveFormConfigurationResponse>({ endpoint: "/api/form-builder/save-form-configuration", body: request, method: "POST" });
  return response;
}
