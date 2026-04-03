import { AREA, errorStack, logServer } from "@znode/logger/server";

import { ISaveConfigurationRequest, IUpdateFormConfigurationResponse } from "@znode/types/form-builder/save-form-configuration";
import { FormWidgetConfigurations_updateFormConfiguration } from "@znode/clients/v2/form-builder/update-form-configuration";
import { getPortalHeader } from "@znode/utils/server";

export async function updateFormConfiguration(request: ISaveConfigurationRequest): Promise<IUpdateFormConfigurationResponse | string> {
  try {
    const portalHeader = await getPortalHeader();

    const formattedRequest: Parameters<typeof FormWidgetConfigurations_updateFormConfiguration>[0] = {
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

    const widgetKey = request.widgetsKey;
    const updateFormConfigurationResponse = await FormWidgetConfigurations_updateFormConfiguration(formattedRequest, widgetKey);

    if (updateFormConfigurationResponse?.IsUpdated) {
      return {
        isUpdated: updateFormConfigurationResponse?.IsUpdated,
      } as IUpdateFormConfigurationResponse;
    }

    const errorMessage: string =
      updateFormConfigurationResponse && "ErrorMessage" in updateFormConfigurationResponse && updateFormConfigurationResponse?.ErrorMessage
        ? String(updateFormConfigurationResponse?.ErrorMessage)
        : `${request.formBuilderId} Not Update!..`;

    logServer.error(AREA.FORM_BUILDER.PUT_FORM_CONFIGURATION, errorMessage);
    return errorMessage;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.PUT_FORM_CONFIGURATION, errorMessage);
    return errorMessage;
  }
}
