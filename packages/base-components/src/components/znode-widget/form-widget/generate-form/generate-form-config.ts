/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFormResponse } from "@znode/types/form-builder/get-form";
import { generateNormalizeAttributes } from "./generate-normalize-attribute";
import { createNumberSchema } from "./schema/create-number-schema";
import { createDateSchema } from "./schema/create-date-schema";
import { createTextSchema } from "./schema/create-text-schema";
import { createTextAreaSchema } from "./schema/create-textarea-schema";
import * as Yup from "yup";
import { createFileSchema } from "./schema/create-file-schema";
import { createImageSchema } from "./schema/create-image-schema";
import { convertDate } from "@znode/utils/component";
import { FORM_MESSAGES, ATTRIBUTE_TYPE_NAME } from "@znode/constants/form-builder";

export function generateFormConfig(params: IFormResponse) {
  const initialValues: Record<string, any> = {};
  const shape: Record<string, any> = {};
  const attributeValidations: Record<string, any> = {};
  const generalSettings = params.generalSettings;

  const normalizeAttributes = generateNormalizeAttributes(params.attributes) as IFormResponse["attributes"];

  normalizeAttributes.forEach((attribute) => {
    const key = attribute.attributeCode;
    initialValues[key] = "";

    switch (attribute.attributeTypeName) {
      case ATTRIBUTE_TYPE_NAME.DATE: {
        const { schema } = createDateSchema(attribute, generalSettings);
        shape[key] = schema;
        let initialDate = "";
        if (attribute.attributeDefaultValue) {
          initialDate = convertDate(attribute.attributeDefaultValue, generalSettings?.dateFormat, undefined);
        }

        initialValues[key] = initialDate ?? "";
        attributeValidations[key] = { defaultValue: attribute?.attributeDefaultValue ?? "" };
        break;
      }

      case ATTRIBUTE_TYPE_NAME.FILE: {
        const { schema, validations } = createFileSchema(attribute);
        shape[key] = schema;
        attributeValidations[key] = validations;
        break;
      }

      case ATTRIBUTE_TYPE_NAME.IMAGE: {
        const { schema, validations } = createImageSchema(attribute);
        shape[key] = schema;
        attributeValidations[key] = validations;
        break;
      }

      case ATTRIBUTE_TYPE_NAME.NUMBER: {
        const { schema } = createNumberSchema(attribute);
        shape[key] = schema;
        initialValues[key] = attribute.attributeDefaultValue ?? "";
        attributeValidations[key] = { defaultValue: attribute?.attributeDefaultValue };
        break;
      }

      case ATTRIBUTE_TYPE_NAME.TEXT: {
        const { schema } = createTextSchema(attribute);
        shape[key] = schema;
        initialValues[key] = attribute?.attributeDefaultValue ?? "";
        break;
      }

      case ATTRIBUTE_TYPE_NAME.TEXT_AREA: {
        const { schema, hasWysiwyg } = createTextAreaSchema(attribute);
        shape[key] = schema;
        attributeValidations[key] = { hasWysiwygEnabled: hasWysiwyg };
        break;
      }

      case ATTRIBUTE_TYPE_NAME.MULTI_SELECT:
      case ATTRIBUTE_TYPE_NAME.SIMPLE_SELECT:
      case ATTRIBUTE_TYPE_NAME.YES_NO: {
        let schema = Yup.string();
        if (attribute.isRequired) {
          schema = Yup.string().required(FORM_MESSAGES.REQUIRED(attribute.attributeName));
        }
        shape[key] = schema;

        if (ATTRIBUTE_TYPE_NAME.YES_NO === attribute.attributeTypeName) {
          initialValues[key] = attribute?.attributeDefaultValue === "true" ? "Yes" : "No";
        }
        break;
      }
    }
  });

  return { initialValues, validationSchema: Yup.object().shape(shape), attributeValidations, normalizeAttributes };
}
