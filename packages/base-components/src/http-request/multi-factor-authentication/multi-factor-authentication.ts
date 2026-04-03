import { IMultiFactorFormData, IValidateMultiFactorAuthenticationResponse, IMultiFactorAuthenticationResponse, IGenerateMultiFactorAuthenticationRequest } from "@znode/types/user";
import { httpRequest } from "../base";

export const validateMultiFactorAuthentication = async (props: IMultiFactorFormData) => {
  const validateMultiFactorAuthenticationResponse = await httpRequest<IValidateMultiFactorAuthenticationResponse>({
    endpoint: "/api/validate-multi-factor-authentication",
    method: "POST",
    body: props,
  });

  return validateMultiFactorAuthenticationResponse;
};

export const generateMultiFactorAuthentication = async (props: IGenerateMultiFactorAuthenticationRequest) => {
  const resendMultiFactorAuthenticationResponse = await httpRequest<IValidateMultiFactorAuthenticationResponse>({
    endpoint: "/api/generate-multi-factor-authentication",
    method: "POST",
    body: props,
  });

  return resendMultiFactorAuthenticationResponse;
};

export const oneTimePasswordDetails = async (userId: number) => {
  const oneTimePasswordDetailsResponse = await httpRequest<IMultiFactorAuthenticationResponse>({
    endpoint: `/api/one-time-password-details?userId=${userId}`,
  });

  return oneTimePasswordDetailsResponse;
};
