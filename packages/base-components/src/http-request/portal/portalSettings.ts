import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../base";

export const checkStoreApprovalSettings = async (props: { paymentCode: string }): Promise<boolean> => {
  const queryString: string = objectToQueryString(props);
  const isApprovalFlagOn = await httpRequest<boolean>({
    endpoint: `/api/store-settings?${queryString}`,
  });
  return isApprovalFlagOn;
};
