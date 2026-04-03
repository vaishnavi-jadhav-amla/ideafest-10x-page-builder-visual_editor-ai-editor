/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpRequest } from "../base";

export async function fileUploadAPI(request: FormData) {
  const response = await httpRequest<unknown>({ endpoint: "/api/file-upload", method: "POST", body: request, contentType: "form-data" });
  return response;
}
