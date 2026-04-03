import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IApproverList } from "@znode/types/account";
import { convertDateTime } from "@znode/utils/component";
import { convertCamelCase } from "@znode/utils/server";
import { getGeneralSettingList } from "../../general-setting";
import { ApprovalRoutings_approverListByClassNumber } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";

export async function getApproverList(orderNumber: string) {
  try {
    const list = await ApprovalRoutings_approverListByClassNumber(orderNumber, undefined, undefined, undefined, undefined, ORDER_DATA_TYPE.APPROVAL_ROUTING);
    const approverHistory = convertCamelCase(list?.ApproverList);

    const generalSetting = await getGeneralSettingList();

    const approverList: IApproverList[] = approverHistory?.map((approver: { approvalDate: string; statusCode: string }) => {
      return {
        ...approver,
        approvalDate:
          approver?.approvalDate !== null ? convertDateTime(approver?.approvalDate, generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone) : "-",
        statusCode: approver?.statusCode === PENDING_APPROVAL_STATUS.PENDING_ORDER_STATUS ? PENDING_APPROVAL_STATUS.PENDING_ORDER_LABEL : approver?.statusCode,
      };
    });

    return approverList;
  } catch (error) {
    logServer.error(AREA.PENDING_ORDER, errorStack(error));
    return {} as IApproverList[];
  }
}
