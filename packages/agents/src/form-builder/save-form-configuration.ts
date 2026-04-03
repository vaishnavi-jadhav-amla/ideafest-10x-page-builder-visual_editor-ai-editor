import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ISaveFormConfigurationResponse, ISaveConfigurationRequest } from "@znode/types/form-builder/save-form-configuration";
import { FormWidgetConfigurations_createFormConfiguration } from "@znode/clients/v2/form-builder/save-form-configuration";
import { getPortalHeader } from "@znode/utils/server";
import { CreateEmailAndFormWidget } from "packages/clients/src/types/interface";

export async function saveFormConfiguration(request: ISaveConfigurationRequest): Promise<ISaveFormConfigurationResponse | string> {
  try {
    const portalHeader = await getPortalHeader();

    const formattedRequest: CreateEmailAndFormWidget = {
      LocaleCode: portalHeader.localeCode,
      WidgetCode: request.widgetCode,
      WidgetsKey: request.widgetsKey,
      CMSMappingId: 0,
      TypeOFMapping: "",
      FormBuilderId: request.formBuilderId,
      FormTitle: request.formTitle,
      ButtonText: request.buttonText,
      IsTextMessage: request.isTextMessage,
      TextMessage: request.textMessage,
      RedirectURL: request.redirectUrl,
      IsShowCaptcha: false,
      EnableCMSPreview: false,
      NotificationUserName: request.notificationUserName,
      NotificationEmailTemplateName: request.notificationEmailTemplateName,
      AcknowledgementEmailTemplateName: request.acknowledgementEmailTemplateName,
    };

    const saveFormConfigurationResponse = await FormWidgetConfigurations_createFormConfiguration(formattedRequest);

    if (saveFormConfigurationResponse?.CMSFormWidgetConfigurationId && saveFormConfigurationResponse?.IsSuccess) {
      return {
        cmsFormWidgetConfigurationId: saveFormConfigurationResponse?.CMSFormWidgetConfigurationId,
        isSuccess: saveFormConfigurationResponse?.IsSuccess,
      } as ISaveFormConfigurationResponse;
    }

    const errorMessage: string =
      saveFormConfigurationResponse && "ErrorMessage" in saveFormConfigurationResponse && saveFormConfigurationResponse?.ErrorMessage
        ? String(saveFormConfigurationResponse?.ErrorMessage)
        : `${request.formBuilderId} Not Created!..`;

    logServer.error(AREA.FORM_BUILDER.POST_FORM_CONFIGURATION, errorMessage);
    return errorMessage;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.POST_FORM_CONFIGURATION, errorMessage);
    return errorMessage;
  }
}
