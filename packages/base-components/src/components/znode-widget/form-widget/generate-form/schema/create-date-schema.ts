import { IFormAttribute } from "@znode/types/form-builder/get-form";
import { convertDate } from "@znode/utils/component";

import * as Yup from "yup";
import { IGeneralSetting } from "@znode/types/general-setting";
import { VALIDATION_NAMES, FORM_MESSAGES } from "@znode/constants/form-builder";

export function createDateSchema(attribute: IFormAttribute, generalSetting: IGeneralSetting | undefined) {
  let schema: Yup.DateSchema = Yup.date();

  if (attribute?.isRequired) {
    schema = schema.required(FORM_MESSAGES.REQUIRED(attribute.attributeName));
  }

  if (attribute.validationList && Array.isArray(attribute.validationList)) {
    for (const validate of attribute.validationList) {
      // Min Date
      if (validate.validationName === VALIDATION_NAMES.MIN_DATE && validate.validationValue) {
        const formattedDate = convertDate(validate.validationValue, generalSetting?.dateFormat, undefined);
        schema = schema.min(formattedDate, FORM_MESSAGES.DATE_TOO_EARLY(attribute.attributeName, formattedDate));
      }

      // Max Date
      if (validate.validationName === VALIDATION_NAMES.MAX_DATE && validate.validationValue) {
        const formattedDate = convertDate(validate.validationValue, generalSetting?.dateFormat, undefined);
        schema = schema.max(formattedDate, FORM_MESSAGES.DATE_TOO_LATE(attribute.attributeName, formattedDate));
      }
    }
  }

  return { schema };
}
