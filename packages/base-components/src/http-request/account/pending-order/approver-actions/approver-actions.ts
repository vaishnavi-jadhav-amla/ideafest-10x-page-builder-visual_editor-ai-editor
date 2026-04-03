import { IApproverButtonStates } from "@znode/types/account";
import { httpRequest } from "../../../base";

export const getApproverActions = async (orderNumber: string) => {
  const approverActions = await httpRequest<IApproverButtonStates>({
    endpoint: "/api/account/pending-order/approver-actions",
    method: "POST",
    body: { orderNumber },
  });
  return approverActions;
};
