import { stringToBoolean, stringToBooleanV2 } from "@znode/utils/common";
import { getPortalDetails } from "../portal";
import { ILoginRecaptcha } from "@znode/types/common";
import { getPortalHeader } from "@znode/utils/server";
import { AREA, errorStack, logServer } from "@znode/logger/server";

export async function getLoginSettings() {
  const requiredProperties = [
    { key: "AttributeCode", value: "RedirectPageOnLogin" },
    { key: "AttributeCode", value: "LoginRequired" },
    { key: "AttributeCode", value: "IsCaptchaRequiredForLogin" },
    { key: "AttributeCode", value: "SiteKey" },
    { key: "AttributeCode", value: "SecretKey" },
    { key: "AttributeCode", value: "Enable2FAForStore" },
    "PortalFeatureValues",
  ];
  try {
    const portalData = await getPortalDetails(requiredProperties);
    const loginRequired = portalData?.loginRequired ? stringToBoolean(`${portalData.loginRequired}`) : false;
    const redirectURL = portalData.redirectPageOnLogin;
    const enableCartRedirection = portalData?.portalFeatureValues?.persistentCart;
    const recaptchaDetails: ILoginRecaptcha = {
      siteKey: portalData?.siteKey || "",
      secretKey: portalData?.secretKey || "",
      isCaptchaRequiredForLogin: portalData && portalData.isCaptchaRequiredForLogin ? stringToBoolean(portalData.isCaptchaRequiredForLogin) : false,
    };
    const isMultiFactorAuthenticationEnabled = portalData?.enable2FAForStore ? stringToBooleanV2(portalData?.enable2FAForStore || "false") : false;
    const { storeCode } = await getPortalHeader();
    return {
      loginRequired,
      redirectURL,
      enableCartRedirection,
      recaptchaDetails,
      storeCode,
      isMultiFactorAuthenticationEnabled,
    };
  } catch (error) {
    logServer.error(AREA.LOGIN, errorStack(error));
    return {
      loginRequired: false,
      redirectURL: "",
      enableCartRedirection: false,
      recaptchaDetails: {
        siteKey: "",
        secretKey: "",
        isCaptchaRequiredForLogin: false,
      },
      storeCode: "",
      isMultiFactorAuthenticationEnabled: false,
    };
  }
}
