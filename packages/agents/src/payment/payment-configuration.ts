import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase, generateTagName } from "@znode/utils/server";
import { IConfigurationSetFields, IPaymentConfiguration, IPaymentConfigurationSetDetails, IPaymentOption, IPaymentSetting, IUserPaymentSetting } from "@znode/types/payment";
import { CONFIGURATION_FIELDS, PAYMENT, PLUGIN_SCOPE, PAYMENT_SUBTYPE, PLUGIN_TYPE } from "@znode/constants/payment";
import {
  FilterTuple,
  PaymentPluginConfiguration_associatedConfigurationSetsGet,
  PaymentPluginConfiguration_paymentMethods,
  Payment_getPaymentSettingByUserDetails,
  PluginConfiguration_configurationSetGet,
  Portal_getPortalApprovalDetailsById,
} from "@znode/clients/v1";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { COMMON } from "@znode/constants/common";
import { getPortalDetails } from "../portal";
import { getSavedUserSession, stringToBoolean } from "@znode/utils/common";

export async function getPaymentConfigurations(portalId: number, storeCode?: string): Promise<IPaymentOption[]> {
  try {
    //TO: DO Remove session dependency
    const userId = (await getSavedUserSession())?.userId;
    const paymentOptionsList: IPaymentOption[] = [];
    if (portalId) {
      const paymentConfigurations = convertCamelCase(await PaymentPluginConfiguration_paymentMethods(portalId, userId ?? 0));
      paymentConfigurations.paymentConfigurationSetModel.forEach((item: IPaymentConfiguration) => {
        const payment = {
          paymentName: item.configurationSetDisplayName,
          paymentCode: item.configurationSetCode ? item.configurationSetCode : "",
          paymentId: item.pluginConfigurationSetId,
          paymentType: item.subType,
          gateway: item.category,
          isSelected: false,
        } as IPaymentOption;
        paymentOptionsList.push(payment);
      });
      const filters = new FilterCollection();
      filters.add(
        COMMON.CACHE_TAG,
        FilterOperators.Equals,
        generateTagName(`${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID},${CACHE_KEYS.PORTAL}`, portalId.toString(), portalId.toString())
      );
      const cacheInvalidator = new FilterCollection();
      cacheInvalidator.add(
        FilterKeys.CacheTags,
        FilterOperators.Contains,
        generateTagName(
          `${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID}, ${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`,
          storeCode || "",
          storeCode || "",
          "GetPortalApprovalDetailsById"
        )
      );
      return paymentOptionsList;
    }
    return paymentOptionsList;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return [] as IPaymentOption[];
  }
}

export async function getPaymentConfigurationByCode(paymentConfigurationCode: string): Promise<IPaymentConfigurationSetDetails | null> {
  try {
    const paymentConfigurationResponse = convertCamelCase(await PluginConfiguration_configurationSetGet(PLUGIN_TYPE.PAYMENT, paymentConfigurationCode));
    const paymentConfigurationSet = {
      configurationSetCode: paymentConfigurationCode,
      configurationSetDisplayName: paymentConfigurationResponse.configurationSet.configurationSetDisplayName,
      pluginName: paymentConfigurationResponse.configurationSet.pluginName,
      scriptPath: paymentConfigurationResponse.configurationSet.scriptPath,
      subType: getValueFromConfigurationSet(paymentConfigurationResponse.configurationSet.fieldsData, undefined, CONFIGURATION_FIELDS.SUBTYPE),
    } as IPaymentConfigurationSetDetails;
    if (paymentConfigurationResponse.configurationSet.fieldsData) {
      if (
        paymentConfigurationSet.subType.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase() ||
        paymentConfigurationSet.subType.toLowerCase() === PAYMENT_SUBTYPE.CHARGE_ON_DELIVERY.toLowerCase() ||
        paymentConfigurationSet.subType.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase()
      ) {
        paymentConfigurationSet.isOAB =
          stringToBoolean(getValueFromConfigurationSet(paymentConfigurationResponse.configurationSet.fieldsData, CONFIGURATION_FIELDS.ENABLE_OAB)) ?? false;
        paymentConfigurationSet.isBillingAddressOptional =
          stringToBoolean(getValueFromConfigurationSet(paymentConfigurationResponse.configurationSet.fieldsData, CONFIGURATION_FIELDS.IS_BILLING_ADDRESS_OPTIONAL)) ?? false;

        if (paymentConfigurationSet.subType.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase()) {
          paymentConfigurationSet.enablePODocumentUpload =
            stringToBoolean(getValueFromConfigurationSet(paymentConfigurationResponse.configurationSet.fieldsData, CONFIGURATION_FIELDS.ENABLE_PO_DOCUMENT_UPLOAD)) ?? false;
          paymentConfigurationSet.isPODocumentUploadRequired =
            stringToBoolean(getValueFromConfigurationSet(paymentConfigurationResponse.configurationSet.fieldsData, CONFIGURATION_FIELDS.IS_PO_DOCUMENT_UPLOAD_REQUIRED)) ?? false;
        }
      } else if (paymentConfigurationSet.subType.toLowerCase() === PAYMENT_SUBTYPE.CREDIT_CARD.toLowerCase())
        paymentConfigurationSet.isCapture = !stringToBoolean(
          getValueFromConfigurationSet(paymentConfigurationResponse.configurationSet.fieldsData, CONFIGURATION_FIELDS.CREDIT_CARD_AUTHORIZATION)
        );
      const selectedPaymentSettings = getPaymentSettingFromJson(paymentConfigurationResponse.configurationSet.fieldsData);
      paymentConfigurationSet.creditCardVerification = selectedPaymentSettings !== undefined && selectedPaymentSettings !== null ? selectedPaymentSettings?.map(child => child.key).toString() : "";
    }
    return paymentConfigurationSet;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return null;
  }
}

export async function getOfflinePaymentConfigurations(portalId: number): Promise<IPaymentOption[]> {
  const paymentOptionsList: IPaymentOption[] = [];

  try {
    if (portalId) {
      const filters = new FilterCollection();
      filters.add(FilterKeys.IsUsedForOffline, FilterOperators.Equals, FilterKeys.ActiveTrueValue);
      const sort: { [key: string]: string } = {};
      sort["DisplayOrder"] = COMMON.ASC;
      const paymentConfigurations = convertCamelCase(
        await PaymentPluginConfiguration_associatedConfigurationSetsGet(
          PLUGIN_TYPE.PAYMENT,
          PLUGIN_SCOPE.STORE,
          portalId,
          undefined,
          filters.filterTupleArray,
          sort,
          undefined,
          undefined
        )
      );
      paymentConfigurations.paymentConfigurationSetModel.forEach((item: IPaymentConfiguration) => {
        const payment = {
          paymentName: item.configurationSetDisplayName,
          paymentCode: item.configurationSetCode ? item.configurationSetCode : "",
          paymentId: item.pluginConfigurationSetId,
          isSelected: false,
        } as IPaymentOption;
        paymentOptionsList.push(payment);
      });
      return paymentOptionsList;
    }
    return paymentOptionsList;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return paymentOptionsList;
  }
}

export async function getPaymentSettingByUserDetailsFromCache(userId: number) {
  try {
    const portalData = await getPortalDetails();

    const paymentSettingModel: IUserPaymentSetting = {
      userId: userId,
      portalId: portalData.portalId,
    };
    const paymentSettingListResponse = convertCamelCase(await Payment_getPaymentSettingByUserDetails(convertPascalCase(paymentSettingModel)));
    const paymentSettingList = { paymentSettings: paymentSettingListResponse?.paymentSettings };
    const filters = new FilterCollection();
    filters.add(
      COMMON.CACHE_TAG,
      FilterOperators.Equals,
      generateTagName(`${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID},${CACHE_KEYS.PORTAL}`, portalData.portalId.toString(), portalData.portalId.toString())
    );

    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(
        `${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID}, ${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`,
        portalData.storeCode || "",
        portalData.storeCode || "",
        "GetPortalApprovalDetailsById"
      )
    );

    const portalApproval = await Portal_getPortalApprovalDetailsById(
      portalData?.portalId,
      undefined,
      filters.filterTupleArray,
      undefined,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const portalApprovalData = convertCamelCase(portalApproval);
    const approvalType = portalApprovalData?.portalApprovalModel?.portalApprovalTypeName;
    if (portalData?.enableApprovalManagement && approvalType === COMMON.STORE) {
      const gatewaysToExclude = [PAYMENT.CARD_CONNECT, PAYMENT.BRAINTREE, PAYMENT.AUTHORIZENET, PAYMENT.PAYPAL_EXPRESS];
      const paymentTypesToExclude = [PAYMENT.ACH, PAYMENT.AMAZON_PAY, PAYMENT.AMAZON_PAY_HOSTED];

      paymentSettingList.paymentSettings = paymentSettingList.paymentSettings.filter(
        (item: { gatewayCode: string; paymentTypeName: string }) => !gatewaysToExclude.includes(item.gatewayCode || "") && !paymentTypesToExclude.includes(item.paymentTypeName)
      );
    }
    return paymentSettingList.paymentSettings;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IPaymentSetting[];
  }
}

function getValueFromConfigurationSet(json: IConfigurationSetFields, targetKey?: string, type?: string): string {
  let result = "";
  try {
    result = String(fetchValueFromJson(json, type, targetKey));
    return result;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return result;
  }
}

function fetchValueFromJson(json: IConfigurationSetFields, type?: string, key?: string): string | undefined {
  let result: string | undefined;

  const recursiveSearch = (obj: IConfigurationSetFields): void => {
    if (result !== undefined) return;

    if (type?.toLowerCase() && obj.type?.toLowerCase() === type.toLowerCase()) {
      result = obj.key;
      return;
    }

    if (key?.toLowerCase() && obj.key?.toLowerCase() === key.toLowerCase()) {
      result = obj.value as string;
      return;
    }

    if (Array.isArray(obj.childrenFields)) {
      for (const child of obj.childrenFields) {
        recursiveSearch(child);
      }
    }

    if (Array.isArray(obj.childrenCategories)) {
      for (const child of obj.childrenCategories) {
        recursiveSearch(child);
      }
    }
  };

  recursiveSearch(json);
  return result;
}

function getPaymentSettingFromJson(json: IConfigurationSetFields): Array<IConfigurationSetFields> | undefined {
  let result: Array<IConfigurationSetFields> | undefined;
  try {
    const recursiveSearch = (obj: IConfigurationSetFields): void => {
      if (result !== undefined) return;

      if ((obj.type?.toLowerCase() === CONFIGURATION_FIELDS.SUBTYPE.toLowerCase()) && (obj.childrenCategorySelectionField?.toLowerCase() === CONFIGURATION_FIELDS.SELECT_PAYMENT_SETTING.toLowerCase())) {
        result = obj.childrenCategories as Array<IConfigurationSetFields>;
        return;
      }

      if (Array.isArray(obj.childrenCategories)) {
        for (const child of obj.childrenCategories) {
          recursiveSearch(child);
        }
      }
    };
    recursiveSearch(json);
    return result;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return result;
  }
}
