import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../../../base";
import { IApproverList } from "@znode/types/account";

export const getApproverList = async (props: { orderNumber: string }) => {
  const queryString: string = objectToQueryString(props);
  const approverList = await httpRequest<IApproverList[]>({ endpoint: `/api/account/pending-order/approver-list?${queryString}` });
  return approverList;
};
