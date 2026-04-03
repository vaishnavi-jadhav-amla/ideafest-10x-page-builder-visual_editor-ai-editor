import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FormBuilders_formBuildersPost } from "@znode/clients/v2/form-builder/save-form";
import { ISaveFormRequest, ISaveFormResponse } from "@znode/types/form-builder/save-form";
import { getPortalHeader } from "@znode/utils/server";
import { FormSubmitAttributeRequest, FormSubmitRequest } from "@znode/clients/v2";
import { checkUniqueValue } from "./check-unique-value";
import { ATTRIBUTE_TYPE_NAME, VALIDATION_NAMES } from "@znode/constants/form-builder";

export async function saveForm(params: ISaveFormRequest): Promise<ISaveFormResponse | string> {
  try {
    const portalHeader = await getPortalHeader();

    const values = Object.entries(params.values);

    const attributes: FormSubmitAttributeRequest[] = [];

    const uniqueAttributes: Parameters<typeof checkUniqueValue>[0]["globalAttributeCodeValueList"] = [];

    for (const [key, value] of values) {
      const getAttribute = params.attributes.find((i) => i.attributeCode === key);

      if (getAttribute) {
        const hasFileOrImage = getAttribute?.attributeTypeName === ATTRIBUTE_TYPE_NAME.FILE || getAttribute?.attributeTypeName === ATTRIBUTE_TYPE_NAME.IMAGE;

        if (hasFileOrImage && Array.isArray(value)) {
          value.forEach((item: { fileName: string; mediaId: string }) => {
            attributes.push({
              GlobalAttributeId: Number(getAttribute.globalAttributeId),
              AttributeName: getAttribute.attributeName,
              AttributeCode: getAttribute.attributeCode,
              AttributeValue: item.fileName,
              AttributeType: String(getAttribute.attributeTypeName),
              LocaleId: portalHeader.localeId,
              MediaId: item.mediaId,
            });
          });
        } else {
          const hasAttributeTypeTextIsUnique =
            getAttribute?.attributeTypeName === ATTRIBUTE_TYPE_NAME.TEXT &&
            getAttribute.validationList.some((i) => i.validationName === VALIDATION_NAMES.UNIQUE_VALUE && i.validationValue === "true");

          if (hasAttributeTypeTextIsUnique) {
            uniqueAttributes.push({
              attributeCode: getAttribute.attributeCode,
              attributeValues: value,
            });
          }

          attributes.push({
            GlobalAttributeId: Number(getAttribute.globalAttributeId),
            AttributeName: getAttribute.attributeName,
            AttributeCode: getAttribute.attributeCode,
            AttributeValue: value,
            AttributeType: String(getAttribute.attributeTypeName),
            LocaleId: portalHeader.localeId,
          });
        }
      }
    }

    if (uniqueAttributes.length > 0) {
      const response = await checkUniqueValue({
        formBuilderId: params.formBuilderId,
        globalAttributeCodeValueList: uniqueAttributes,
      });

      if (response && response?.attributeValues && Array.isArray(response.attributeValues)) {
        const isValueExist = response.attributeValues.filter((i) => i?.isValueExist === true);
        if (isValueExist.length > 0) {
          const existValues = isValueExist.map((i) => i.attributeName).join(",");
          const errorMessage = `${existValues} already exists.`;
          return errorMessage;
        }
      }
    }

    const formattedFormTemplateRequest: FormSubmitRequest = {
      FormBuilderId: params.formBuilderId,
      LocaleCode: portalHeader.localeCode,
      PortalCode: portalHeader.storeCode,
      FormCode: params.formCode,
      IsSuccess: false,
      Attributes: attributes,
      WidgetsKey: params.widgetKey
    };

    const formTemplateResponse = await FormBuilders_formBuildersPost(formattedFormTemplateRequest);

    if (formTemplateResponse.FormResponseModel) {
      return {
        formBuilderId: formTemplateResponse.FormResponseModel.FormBuilderId,
      };
    }

    const errorMessage: string =
      formTemplateResponse && "ErrorMessage" in formTemplateResponse && formTemplateResponse?.ErrorMessage
        ? String(formTemplateResponse?.ErrorMessage)
        : `${params?.formTitle || "Form"} Not Submitted!..`;

    return errorMessage;
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.POST_FORM, errorMessage);
    return errorMessage;
  }
}
