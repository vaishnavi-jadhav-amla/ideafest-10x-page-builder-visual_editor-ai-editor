import { APPROVAL_STATUS_LABEL, PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";
import { IApproverList } from "@znode/types/account";

// Method to get the appropriate button states based on the conditions
export function getApproverActions(userName: string, approversList: IApproverList[]): { showPlaceOrderButton: boolean; showRejectButton: boolean; showApproveButton: boolean } {
  const response = { showPlaceOrderButton: false, showRejectButton: false, showApproveButton: false };

  const approver = approversList.find((approver) => approver.approverName === userName);

  if (approver) {
    if (approver.isMultiLevel) {
      const sortedApprovers = approversList.filter((a) => a.isMultiLevel).sort((a, b) => (a.approverOrder || 0) - (b.approverOrder || 0));
      const lastApprover = sortedApprovers[sortedApprovers.length - 1];

      if (approver.approverOrder === lastApprover.approverOrder && approver.statusCode === PENDING_APPROVAL_STATUS.PENDING_ORDER_LABEL) {
        response.showPlaceOrderButton = true;
        response.showRejectButton = true;
        response.showApproveButton = false;
      } else if (([1, 2, 3, 4, 5].includes(approver.approverOrder) && approver.statusCode === PENDING_APPROVAL_STATUS.PENDING_ORDER_LABEL) && approver.statusCode === PENDING_APPROVAL_STATUS.PENDING_ORDER_LABEL) {
        response.showPlaceOrderButton = false;
        response.showRejectButton = true;
        response.showApproveButton = true;
      } else if (approver.statusCode === APPROVAL_STATUS_LABEL.APPROVED || approver.statusCode === APPROVAL_STATUS_LABEL.REJECTED) {
        response.showPlaceOrderButton = false;
        response.showRejectButton = false;
        response.showApproveButton = false;
      }
    } else if (approver.statusCode === PENDING_APPROVAL_STATUS.PENDING_ORDER_LABEL) {
      response.showPlaceOrderButton = true;
      response.showRejectButton = true;
      response.showApproveButton = false;
    } else if (approver.statusCode === APPROVAL_STATUS_LABEL.APPROVED || approver.statusCode === APPROVAL_STATUS_LABEL.REJECTED) {
      response.showPlaceOrderButton = false;
      response.showRejectButton = false;
      response.showApproveButton = false;
    }
  }

  return response;
}
