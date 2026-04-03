import { ISingleSigninRequest, IUserLoginResponse } from "@znode/types/single-sign-in";
import { httpRequest } from "../base";
import { IUserDetailResponse } from "@znode/types/user";

export const getSingleSignInToken = async ({ username, password }: { username: string; password: string; storeCode: string }) => {
  const signSignInDetails = await httpRequest<IUserDetailResponse>({ endpoint: "/api/get-user-token", body: { username, password } });
  return signSignInDetails;
};

export const getSingleSignInUserDetails = async (singleSignInLoginDetails: ISingleSigninRequest) => {
  const singleSignInUserDetails = await httpRequest<IUserLoginResponse>({
    endpoint: singleSignInLoginDetails.domainName + "/api/single-sign-in-user",
    queryParams: singleSignInLoginDetails,
  });
  return singleSignInUserDetails;
};
