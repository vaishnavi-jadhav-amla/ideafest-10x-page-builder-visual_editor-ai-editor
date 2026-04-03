import { IFormAttribute } from "@znode/types/form-builder/get-form";
import * as Yup from "yup";
import { VALIDATION_NAMES, FORM_MESSAGES } from "@znode/constants/form-builder";

export function createFileSchema(attribute: IFormAttribute) {
  let schema: Yup.MixedSchema = Yup.mixed();

  const validations = {
    maxFileSize: undefined as string | null | undefined,
    allowExtensions: [] as Array<string>,
    hasAllowMultiUpload: false,
  };

  if (attribute?.validationList && Array.isArray(attribute.validationList)) {
    for (const v of attribute.validationList) {
      if (v.validationName === VALIDATION_NAMES.MAX_FILE_SIZE) {
        validations.maxFileSize = v.validationValue;
      }

      if (v.validationName === VALIDATION_NAMES.EXTENSIONS && v.subValidationName) {
        validations.allowExtensions.push(v.subValidationName.toLowerCase());
      }

      if (v.validationName === VALIDATION_NAMES.IS_ALLOW_MULTI_UPLOAD) {
        validations.hasAllowMultiUpload = v.validationValue === "true";
      }
    }

    schema = schema.test("File Validation", `${attribute.attributeName} validation failed`, function (value) {
      const { path, createError } = this;

      const files: File[] = (() => {
        if (!value) return [];

        if (validations.hasAllowMultiUpload) return Array.isArray(value) ? value : [value];
        return [value];
      })();

      if (attribute.isRequired && files.length === 0) {
        return createError({ path, message: FORM_MESSAGES.REQUIRED(attribute.attributeName) });
      }

      if (files.length === 0) return true;

      if (validations.maxFileSize) {
        const sizeLimitInMB = Number(validations.maxFileSize);
        const sizeLimitInBytes = Number(validations.maxFileSize) * 1024 * 1024;

        const oversizedFiles = files.filter((file) => file.size > sizeLimitInBytes);

        if (oversizedFiles.length > 0) {
          return createError({
            path,
            message: FORM_MESSAGES.FILE_TOO_LARGE(sizeLimitInMB),
          });
        }
      }

      return true;
    });
  }

  return {
    schema,
    validations,
  };
}
