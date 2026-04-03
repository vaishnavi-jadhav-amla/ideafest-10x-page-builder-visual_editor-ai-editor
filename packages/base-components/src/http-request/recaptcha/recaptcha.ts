import { httpRequest } from "../base";
import { IRecaptchaResponse, IRecaptchaPayload } from "@znode/types/recaptcha";
export const verifyRecaptcha = async (props: IRecaptchaPayload): Promise<IRecaptchaResponse> => {
  const recaptchaResponse = await httpRequest<IRecaptchaResponse>({ endpoint: "/api/recaptcha-verify", body: props });
  return recaptchaResponse;
};