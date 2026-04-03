export interface IWidgetEmailConfiguration {
  notificationUserName: string | undefined;
  notificationEmailTemplateName: string | undefined;
  acknowledgementEmailTemplateName: string | undefined;
}

export interface IGetFormConfigurationResponse {
  cmsFormWidgetConfigurationId: number;
  localeId: number | undefined;
  portalId: number | undefined;
  cmsWidgetsId: number | undefined;
  widgetsKey: string | undefined;
  cmsMappingId: number | undefined;
  typeOfMapping: string | undefined;
  formBuilderId: number | undefined;
  formTitle: string;
  buttonText: string | undefined;
  isTextMessage: boolean | undefined;
  textMessage: string | undefined;
  redirectUrl: string | undefined;
  isShowCaptcha: boolean | undefined;
  enableCmsPreview: boolean | undefined;
  storeCode: string;
  widgetEmailConfiguration: IWidgetEmailConfiguration;
}

export interface IGetFormConfigurationRequest {
  widgetKey: string;
  storeCode: string;
}
