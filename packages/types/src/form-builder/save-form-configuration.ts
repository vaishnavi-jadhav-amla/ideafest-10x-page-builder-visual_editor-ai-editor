export interface ISaveConfigurationRequest {
  localeCode: string;
  widgetCode: string;
  widgetsKey: string;
  cmsMappingId: number;
  typeOfMapping: string;
  formBuilderId: number;
  formTitle: string;
  buttonText: string;
  isTextMessage: boolean;
  textMessage: string;
  redirectUrl: string;
  isShowCaptcha: boolean;
  enableCmsPreview: boolean;
  notificationUserName: string;
  notificationEmailTemplateName: string;
  acknowledgementEmailTemplateName: string;
}

export interface ISaveFormConfigurationResponse {
  cmsFormWidgetConfigurationId: number;
  isSuccess: boolean;
}

export interface IUpdateFormConfigurationResponse {
  isUpdated: boolean;
}
