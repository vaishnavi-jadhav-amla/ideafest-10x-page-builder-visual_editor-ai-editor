import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FormWidgetConfigurations_formWidgetConfigurationsGetByStoreCode } from "@znode/clients/v2/form-builder/get-form-configurations";
import { IGetFormConfigurationResponse, IGetFormConfigurationRequest } from "@znode/types/form-builder/get-form-configuration";

export async function getFormConfiguration(request: IGetFormConfigurationRequest): Promise<IGetFormConfigurationResponse | null> {
  try {
    const formConfigurationResponse = await FormWidgetConfigurations_formWidgetConfigurationsGetByStoreCode(request.storeCode, request.widgetKey);

    if (!formConfigurationResponse) {
      throw new Error("Form configuration response is null or undefined.");
    }

    if (!formConfigurationResponse?.CMSFormWidgetConfigurationId) {
      const errorMessage: string =
        "ErrorMessage" in formConfigurationResponse && formConfigurationResponse?.ErrorMessage ? String(formConfigurationResponse?.ErrorMessage) : "Unexpected response structure.";

      logServer.error(AREA.FORM_BUILDER.GET_FORM_CONFIGURATION, errorMessage);
      return null;
    }

    const formattedGetFormConfigurationResponse: IGetFormConfigurationResponse = {
      cmsFormWidgetConfigurationId: formConfigurationResponse?.CMSFormWidgetConfigurationId,
      localeId: formConfigurationResponse?.LocaleId,
      portalId: formConfigurationResponse?.PortalId,
      cmsWidgetsId: formConfigurationResponse?.CMSWidgetsId,
      widgetsKey: formConfigurationResponse?.WidgetsKey,
      cmsMappingId: formConfigurationResponse?.CMSMappingId,
      typeOfMapping: formConfigurationResponse?.TypeOFMapping,
      formBuilderId: formConfigurationResponse?.FormBuilderId,
      formTitle: formConfigurationResponse?.FormTitle ?? "",
      buttonText: formConfigurationResponse?.ButtonText,
      isTextMessage: formConfigurationResponse?.IsTextMessage,
      textMessage: formConfigurationResponse?.TextMessage,
      redirectUrl: formConfigurationResponse?.RedirectURL,
      isShowCaptcha: formConfigurationResponse?.IsShowCaptcha,
      enableCmsPreview: formConfigurationResponse?.EnableCMSPreview,
      storeCode: formConfigurationResponse?.StoreCode || "",
      widgetEmailConfiguration: {
        notificationUserName: formConfigurationResponse?.WidgetEmailConfiguration?.NotificationUserName,
        notificationEmailTemplateName: formConfigurationResponse?.WidgetEmailConfiguration?.NotificationEmailTemplateName,
        acknowledgementEmailTemplateName: formConfigurationResponse?.WidgetEmailConfiguration?.AcknowledgementEmailTemplateName,
      },
    };

    return formattedGetFormConfigurationResponse;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.GET_FORM_CONFIGURATION, errorMessage);
    return null;
  }
}
