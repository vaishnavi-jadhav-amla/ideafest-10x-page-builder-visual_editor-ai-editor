import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FormBuilders_checkUniqueValue } from "@znode/clients/v2/form-builder/check-unique-value";
import { ICheckUniqueRequest, ICheckUniqueResponse } from "@znode/types/form-builder/check-unique-value";

export async function checkUniqueValue(request: ICheckUniqueRequest): Promise<ICheckUniqueResponse | null> {
  try {
    if (!request.formBuilderId || !Array.isArray(request.globalAttributeCodeValueList)) {
      logServer.warn(AREA.FORM_BUILDER.CHECK_UNIQUE_VALUE, "Invalid input received");
      return null;
    }

    const requestFormatted: Parameters<typeof FormBuilders_checkUniqueValue>[0] = {
      FormBuilderId: request.formBuilderId,
      GlobalAttributeCodeValueList: request.globalAttributeCodeValueList.map((item) => ({
        AttributeCode: item.attributeCode,
        AttributeValues: item.attributeValues,
      })),
    };

    const checkUniqueResponse = await FormBuilders_checkUniqueValue(requestFormatted);

    if (!checkUniqueResponse?.AttributeValues) {
      const errorMessage: string =
        "ErrorMessage" in checkUniqueResponse && checkUniqueResponse?.ErrorMessage ? String(checkUniqueResponse?.ErrorMessage) : "Internal Server Error.";

      logServer.error(AREA.FORM_BUILDER.CHECK_UNIQUE_VALUE, errorMessage);
      return null;
    }

    const attributeValues = checkUniqueResponse.AttributeValues || [];

    const result = attributeValues.map((item) => ({
      attributeName: item.AttributeName,
      isValueExist: item.IsValueExist,
    }));

    return {
      attributeValues: result,
    };
  } catch (error) {
    const errorMessage = errorStack(error);
    logServer.error(AREA.FORM_BUILDER.CHECK_UNIQUE_VALUE, errorMessage);
    return null;
  }
}
