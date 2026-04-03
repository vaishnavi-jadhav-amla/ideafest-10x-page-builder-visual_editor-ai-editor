import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterTuple, Portals_approvalDetailsByStoreCode } from "@znode/clients/v2";
import { PLUGIN_TYPE } from "@znode/constants/payment";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export async function checkStoreSettings(paymentCode: string, storeCode: string) {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, storeCode || "", "ApprovalDetailsByStoreCode"));
    const portalApproval = await Portals_approvalDetailsByStoreCode(storeCode, cacheInvalidator.filterTupleArray as FilterTuple[]);
    const portalApprovalData = convertCamelCase(portalApproval);
    const approvalType = portalApprovalData?.portalApprovalModel?.portalApprovalTypeName;

    if (approvalType === PLUGIN_TYPE.PAYMENT) {
      const userApproverList = portalApprovalData?.portalApprovalModel?.portalPaymentUserApproverList;

      if (Array.isArray(userApproverList) && userApproverList.length > 0) {
        return userApproverList.some((approver) => {
          const configurationSetCodes = approver?.configurationSetCodes || [];
          return configurationSetCodes.includes(paymentCode);
        });
      }
    }

    return false;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return false;
  }
}
