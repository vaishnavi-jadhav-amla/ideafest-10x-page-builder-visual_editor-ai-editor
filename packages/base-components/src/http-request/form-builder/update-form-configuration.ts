import { httpRequest } from "../base";

import { ISaveConfigurationRequest, IUpdateFormConfigurationResponse } from "@znode/types/form-builder/save-form-configuration";

export async function updateFormConfigurationAPI(request: ISaveConfigurationRequest) {
  const response = await httpRequest<IUpdateFormConfigurationResponse>({ endpoint: "/api/form-builder/update-form-configuration", body: request, method: "PUT" });
  return response;
}
