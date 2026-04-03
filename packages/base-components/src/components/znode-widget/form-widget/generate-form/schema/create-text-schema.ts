import { IFormAttribute } from "@znode/types/form-builder/get-form";
import * as Yup from "yup";
import { VALIDATION_NAMES, FORM_MESSAGES } from "@znode/constants/form-builder";

export function createTextSchema(attribute: IFormAttribute) {
  let schema = Yup.string();

  if (attribute.isRequired) {
    schema = schema.required(FORM_MESSAGES.REQUIRED(attribute.attributeName)).matches(/^(.*\S.*)$/, FORM_MESSAGES.REQUIRED(attribute.attributeName));
  }

  for (const v of attribute.validationList || []) {
    if (v.validationName === VALIDATION_NAMES.MAX_CHARACTERS && v.validationValue) {
      schema = schema.max(Number(v.validationValue), FORM_MESSAGES.MAX_CHARACTERS(attribute.attributeName, v.validationValue));
    }

    if (v.validationName === VALIDATION_NAMES.REGULAR_EXPRESSION && v.validationValue && v.validationValue !== "") {
      try {
        schema = schema.matches(new RegExp(v.validationValue), FORM_MESSAGES.INVALID_PATTERN(attribute.attributeName, v.validationValue));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid regular expression for attribute '${attribute.attributeName}': ${v.validationValue}`, e);
      }
    } else if (v.validationName === VALIDATION_NAMES.VALIDATION_RULE && v.isRegExp && v.regExp) {
      if (v.subValidationName === "Alphanumeric") {
        schema = schema.matches(new RegExp(v.regExp), FORM_MESSAGES.INVALID_FORMAT(attribute.attributeName));
      } else if (v.subValidationName === "Email") {
        schema = schema.email(FORM_MESSAGES.INVALID_EMAIL(attribute.attributeName)).matches(new RegExp(v.regExp), FORM_MESSAGES.INVALID_EMAIL(attribute.attributeName));
      } else if (v.subValidationName === "URL") {
        schema = schema.url(FORM_MESSAGES.INVALID_URL(attribute.attributeName)).matches(new RegExp(v.regExp), FORM_MESSAGES.INVALID_URL(attribute.attributeName));
      }
    }
  }

  return {
    schema,
  };
}
