import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FormBuilders_formBuildersGetByWidgetKey } from "@znode/clients/v2/form-builder/get-form";
import { IFormAttribute, IFormGroup, IFormResponse } from "@znode/types/form-builder/get-form";
import { getPortalHeader } from "@znode/utils/server";
import { getGeneralSettingList } from "../general-setting";

export async function getForm(params: Record<string, unknown>): Promise<IFormResponse | null> {
  try {
    let formCodeWidgetKey = "";

    const config = params?.config;

    if (
      config &&
      typeof config === "object" &&
      "postMessagePayload" in config &&
      config.postMessagePayload &&
      typeof config.postMessagePayload === "object" &&
      "data" in config.postMessagePayload &&
      config.postMessagePayload.data &&
      typeof config.postMessagePayload.data === "object" &&
      "widgetKey" in config.postMessagePayload.data &&
      typeof config.postMessagePayload.data.widgetKey === "string"
    ) {
      formCodeWidgetKey = config?.postMessagePayload?.data.widgetKey;
    }

    const portalHeader = await getPortalHeader();

    const localeCode = portalHeader.localeCode;
    const localeId = portalHeader.localeId;

    const formTemplateResponse = await FormBuilders_formBuildersGetByWidgetKey(formCodeWidgetKey, localeCode, undefined);

    if (!formTemplateResponse?.FormBuilderId) {
      const errorMessage: string =
        "ErrorMessage" in formTemplateResponse && formTemplateResponse?.ErrorMessage ? String(formTemplateResponse?.ErrorMessage) : "Unexpected response structure.";

      logServer.error(AREA.FORM_BUILDER.GET_FORM_TEMPLATE, errorMessage);
      return null;
    }

    const generalSettingsList = await getGeneralSettingList();

    const FormBuilderAttributeGroup = formTemplateResponse;

    const groups = FormBuilderAttributeGroup.Groups || [];
    const attributes = FormBuilderAttributeGroup?.Attributes || [];

    const formattedGroups: IFormGroup[] = groups.map((item) => ({
      attributeGroupName: item.AttributeGroupName,
      displayOrder: item.DisplayOrder,
      globalAttributeGroupId: item.GlobalAttributeGroupId,
      groupCode: item.GroupCode,
    }));

    const formattedAttributes: IFormAttribute[] = attributes.map((item) => ({
      globalAttributeId: item.GlobalAttributeId,
      globalAttributeGroupId: item.GlobalAttributeGroupId,
      attributeTypeName: item.AttributeTypeName ?? "",
      attributeCode: item.AttributeCode || "",
      isRequired: item.IsRequired || false,
      isLocalizable: item.IsLocalizable || false,
      attributeName: item.AttributeName || "",
      isEditable: item.IsEditable || false,
      mediaId: item.MediaId,
      helpDescription: item.HelpDescription,
      validations: item.Validations,
      attributeDefaultValueCode: item.AttributeDefaultValueCode,
      attributeDefaultValue: item?.AttributeDefaultValue,
      displayOrder: item.DisplayOrder,
      validationList:
        item.ValidationList?.map((validationItem) => ({
          controlName: validationItem.ControlName || "",
          validationName: validationItem.ValidationName || "",
          subValidationName: validationItem.SubValidationName || "",
          regExp: validationItem.RegExp || "",
          validationValue: validationItem.ValidationValue || "",
          isRegExp: validationItem.IsRegExp || false,
        })) || [],
    }));

    const result: IFormResponse = {
      localeId: localeId,
      formBuilderId: FormBuilderAttributeGroup.FormBuilderId,
      formCode: FormBuilderAttributeGroup.FormCode || "",
      formTitle: FormBuilderAttributeGroup.FormTitle || "",
      buttonText: FormBuilderAttributeGroup.ButtonText || "",
      textMessage: FormBuilderAttributeGroup.TextMessage || "",
      isShowCaptcha: FormBuilderAttributeGroup?.IsShowCaptcha || false,
      isTextMessage: FormBuilderAttributeGroup?.IsTextMessage || false,
      redirectURL: FormBuilderAttributeGroup.RedirectURL || "",
      groups: formattedGroups || [],
      attributes: formattedAttributes,
      generalSettings: generalSettingsList,
    };

    return result;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.GET_FORM_TEMPLATE, errorMessage);
    return null;
  }
}
