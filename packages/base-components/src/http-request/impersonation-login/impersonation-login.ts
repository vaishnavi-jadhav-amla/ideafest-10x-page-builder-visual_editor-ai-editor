import { IImpersonationRequest, IImpersonationResponse } from "@znode/types/impersonation";
import { httpRequest } from "../base";


export const impersonationLogin = async (impersonationLoginDetails: IImpersonationRequest) => {  
  const impersonateUserDetails: IImpersonationResponse = await httpRequest<IImpersonationResponse>({
    endpoint: impersonationLoginDetails.domainName + "/api/impersonation-login",
    queryParams: impersonationLoginDetails,
  });
  return impersonateUserDetails;
};
