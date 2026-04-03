import { IFormAttribute } from "@znode/types/form-builder/get-form";
import * as Yup from "yup";
import { VALIDATION_NAMES, FORM_MESSAGES } from "@znode/constants/form-builder";

export function createTextAreaSchema(attribute: IFormAttribute) {
  let schema: Yup.StringSchema = Yup.string();
  const hasWysiwyg = attribute.validationList?.some((v) => v.validationName === VALIDATION_NAMES.WYSIWYG_ENABLED_PROPERTY && v.validationValue === "true");

  if (hasWysiwyg) {
    schema = schema.test("not-empty-wysiwyg", FORM_MESSAGES.REQUIRED(attribute.attributeName), (value) => {
      if (attribute.isRequired) {
        const trimmed = (value || "").trim();
        return trimmed !== "" && trimmed !== "<p><br></p>";
      }
      return true;
    });
  } else {
    for (const v of attribute.validationList || []) {
      if (v.validationName === VALIDATION_NAMES.MAX_CHARACTERS && v.validationValue) {
        schema = schema.max(Number(v.validationValue), FORM_MESSAGES.MAX_CHARACTERS(attribute.attributeName, v.validationValue));
      }
    }

    if (attribute.isRequired) {
      schema = schema.required(FORM_MESSAGES.REQUIRED(attribute.attributeName)).matches(/^(.*\S.*)$/, FORM_MESSAGES.REQUIRED(attribute.attributeName));
    }
  }

  return { schema, hasWysiwyg };
}
