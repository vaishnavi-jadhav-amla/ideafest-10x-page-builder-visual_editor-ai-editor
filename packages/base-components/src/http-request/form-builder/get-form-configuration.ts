import { httpRequest } from "../base";

import { IGetFormConfigurationResponse } from "@znode/types/form-builder/get-form-configuration";

export async function getFormConfigurationAPI(request: { widgetKey: string }) {
  const response = await httpRequest<IGetFormConfigurationResponse>({ endpoint: "/api/form-builder/get-form-configuration", queryParams: request });
  return response;
}
