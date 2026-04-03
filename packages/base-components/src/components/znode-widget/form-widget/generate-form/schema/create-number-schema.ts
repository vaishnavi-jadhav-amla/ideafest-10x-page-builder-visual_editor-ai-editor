import { IFormAttribute } from "@znode/types/form-builder/get-form";
import * as Yup from "yup";
import { VALIDATION_NAMES, FORM_MESSAGES } from "@znode/constants/form-builder";

export function createNumberSchema(attribute: IFormAttribute) {
  let schema = Yup.number();

  if (attribute.isRequired) {
    schema = schema.required(FORM_MESSAGES.REQUIRED(attribute.attributeName));
  }

  let allowNegative = false;
  let allowDecimals = false;
  let min: number | undefined;
  let max: number | undefined;

  attribute.validationList?.forEach((v) => {
    switch (v.validationName) {
      case VALIDATION_NAMES.ALLOW_NEGATIVE:
        allowNegative = v.validationValue === "true";
        break;
      case VALIDATION_NAMES.ALLOW_DECIMALS:
        allowDecimals = v.validationValue === "true";
        break;
      case VALIDATION_NAMES.MIN_NUMBER:
        min = v.validationValue ? Number(v.validationValue) : undefined;
        break;
      case VALIDATION_NAMES.MAX_NUMBER:
        max = v.validationValue ? Number(v.validationValue) : undefined;
        break;
    }
  });

  schema = schema.test("number-validation", "", function (value?: number) {
    const { path, createError } = this;

    // Skip if empty
    if (value === undefined || value === null) return true;

    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      return createError({ path, message: FORM_MESSAGES.INVALID_FORMAT(attribute.attributeName) });
    }

    // Check for negative values
    if (!allowNegative && numericValue < 0) {
      return createError({ path, message: FORM_MESSAGES.CANNOT_BE_NEGATIVE(attribute.attributeName) });
    }

    // Check for decimal values
    if (!allowDecimals && !Number.isInteger(numericValue)) {
      return createError({ path, message: FORM_MESSAGES.MUST_BE_INTEGER(attribute.attributeName) });
    }

    // Custom min/max/range messages
    if (typeof min === "number" && typeof max === "number") {
      if (numericValue < min || numericValue > max) {
        return createError({ path, message: FORM_MESSAGES.RANGE_NUMBER(attribute.attributeName, min, max) });
      }
    } else if (typeof min === "number" && numericValue < min) {
      return createError({ path, message: FORM_MESSAGES.MIN_NUMBER(attribute.attributeName, min) });
    } else if (typeof max === "number" && numericValue > max) {
      return createError({ path, message: FORM_MESSAGES.MAX_NUMBER(attribute.attributeName, max) });
    }

    return true;
  });

  return { schema };
}
