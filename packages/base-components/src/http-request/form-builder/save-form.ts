import { httpRequest } from "../base";

import { ISaveFormRequest, ISaveFormResponse } from "@znode/types/form-builder/save-form";

export async function saveFormAPI(request: ISaveFormRequest) {
  const response = await httpRequest<ISaveFormResponse>({ endpoint: "/api/form-builder/save-form", body: request, method: "POST" });
  return response;
}
