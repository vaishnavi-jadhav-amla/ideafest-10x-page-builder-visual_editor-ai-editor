import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ATTRIBUTE, CONTROL_TYPES } from "@znode/constants/attribute";
import { IAttributeDetails, IBaseAttribute } from "@znode/types/attribute";

import { PIMAttribute_getAttributeValidationByCodes } from "@znode/clients/v1";
import { convertCamelCase } from "@znode/utils/server";

export const getPersonalizedAttributes = async (attributes: IBaseAttribute[], productId?: number) => {
  const personalizeAttributes: IBaseAttribute[] = attributes.filter((x) => x?.attributeTypeName === "Text" && x?.isPersonalizable);

  const remainingAttributes = attributes.filter((x) => !(x?.attributeTypeName === "Text" && x?.isPersonalizable));

  if (personalizeAttributes.length > 0 && productId !== undefined) {
    const newAttributes = await getAttributeValidationByCodes(productId, personalizeAttributes as IAttributeDetails[]);
    return [...remainingAttributes, ...newAttributes];
  }
  return remainingAttributes;
};

export const isPersonalizedAttributesAvailable = (attributes: IBaseAttribute[]) => {
  return attributes.some((x) => x?.attributeTypeName === "Text" && x?.isPersonalizable);
};

export async function getAttributeValidationByCodes(productId: number, attributes: IAttributeDetails[], localeId?: number) {
  try { 
    // Extract attribute codes from the attributes
    const attributeCodes = attributes.map((attr) => attr?.attributeCode).join(",");

    // Fetch attribute validation details
    const attributesDetails = await PIMAttribute_getAttributeValidationByCodes({
      ParentProductId: productId,
      HighLightsCodes: attributeCodes,
      LocaleId: localeId ?? 0,
    });
    const attributeListData = convertCamelCase(attributesDetails.PIMFamilyDetails?.Attributes);
    const personalizedValidations = createValidationObjects(attributeListData);
    const attributesData: IAttributeDetails[] = attributeListData || [];

    // Update original attributes with validation data
    attributes.forEach((attribute) => {
      const personalizedAttribute = attributesData.find((attr) => attr.attributeCode === attribute.attributeCode);
      if (personalizedAttribute) {
        Object.assign(attribute, {
          isPersonalizable: personalizedAttribute.isPersonalizable || attribute.isPersonalizable,
          isRequired: personalizedAttribute.isRequired || attribute.isRequired,
          attributeTypeName: personalizedAttribute.attributeTypeName,
          pimAttributeId: personalizedAttribute.pimAttributeId,
          attributeValues: personalizedAttribute.attributeValues || attribute.attributeValues,
          validation: personalizedValidations[`${personalizedAttribute.attributeCode}`],
          custom1: personalizedAttribute.custom1,
          custom2: personalizedAttribute.custom2,
          custom3: personalizedAttribute.custom3,
          custom4: personalizedAttribute.custom4,
          custom5: personalizedAttribute.custom5,
        });
      }
    });

    // Get distinct attribute codes for the controls
    const distinctAttributeCodes = Array.from(new Set(attributes.map((attr) => `${attr.attributeCode}${attr.pimAttributeId}`).filter(Boolean)));

    const attributeList = getAttributeControls(attributes, distinctAttributeCodes);
    return convertCamelCase(attributeList);
  } catch (error) {
    logServer.error(AREA.ATTRIBUTE, errorStack(error));
    return [] as IBaseAttribute[];
  }
}

function createValidationObjects(data: IAttributeDetails[]) {
  const validations: { [attributeCode: string]: { [validationName: string]: string } } = {};

  data.forEach((item) => {
    const { attributeCode, validationName, validationValue } = item;
    if (!validations[`${attributeCode}`]) {
      validations[`${attributeCode}`] = {};
    }
    validations[`${attributeCode}`][`${validationName}`] = validationValue as string;
  });

  return validations;
}
export function getAttributeControls(attributeValueList: IAttributeDetails[], distinctAttributeCodes: string[]): IBaseAttribute[] {
  const finalAttributeList = new Map<string, IBaseAttribute>();

  attributeValueList?.forEach((item) => {
    if (item?.attributeCode && item?.pimAttributeId) {
      const key = item.attributeCode + item.pimAttributeId;
      finalAttributeList.set(key, item);
    }
  });

  const uniqueAttributes = Array.from(finalAttributeList.values());

  distinctAttributeCodes?.forEach((code, index) => {
    mapFinalAttributeList(uniqueAttributes as IAttributeDetails[], attributeValueList, code, index);
  });

  return uniqueAttributes;
}

function mapFinalAttributeList(finalAttributeList: IAttributeDetails[], attributeValueList: IAttributeDetails[], item: string, index: number) {
  const attributesList: IAttributeDetails[] = attributeValueList?.filter((attributeValue) => {
    if (attributeValue?.attributeCode && attributeValue?.pimAttributeId) {
      return attributeValue?.attributeCode + attributeValue?.pimAttributeId?.toString() === item;
    }
    return false;
  });
  if (attributesList) {
    const attribute = attributesList[0];
    if (finalAttributeList && finalAttributeList[index]) {
      if (!finalAttributeList[index]?.controlProperty) {
        finalAttributeList[index].controlProperty = {};
      }
      if (!finalAttributeList[index]?.controlProperty?.htmlAttributes) {
        finalAttributeList[index].controlProperty.htmlAttributes = {};
      }

      if (finalAttributeList[index]?.isPersonalizable) {
        finalAttributeList[index].controlProperty.htmlAttributes[ATTRIBUTE.IS_PERSONALIZABLE] = ATTRIBUTE.TRUE_VALUE;
        finalAttributeList[index].controlProperty.htmlAttributes[ATTRIBUTE.PLACEHOLDER] = finalAttributeList[index]?.attributeValues ?? "";
        finalAttributeList[index].controlProperty.htmlAttributes[ATTRIBUTE.VALIDATION] = finalAttributeList[index]?.validation || null;
      }
      finalAttributeList[index].controlProperty.id = attribute?.attributeCode;
      finalAttributeList[index].controlProperty.controlType = attribute?.attributeTypeName;
      finalAttributeList[index].controlProperty.name = attribute?.attributeCode;
      finalAttributeList[index].controlProperty.controlLabel = attribute?.attributeName;
      finalAttributeList[index].controlProperty.value = !attribute?.attributeValue ? attribute?.attributeDefaultValue : attribute?.attributeValue;

      if (attribute?.isRequired) {
        if (IsKeyNotPresent(ATTRIBUTE.IS_REQUIRED, finalAttributeList[index]?.controlProperty?.htmlAttributes))
          finalAttributeList[index].controlProperty.htmlAttributes[ATTRIBUTE.IS_REQUIRED] = String(attribute.isRequired ?? false);
      }
      if (attribute?.attributeTypeName?.replace(" ", "") === CONTROL_TYPES.LABEL) finalAttributeList[index].controlProperty.value = attribute?.attributeDefaultValue;

      attributesList.forEach((dataItem) => {
        mapHtmlAttributes(index, finalAttributeList, dataItem, attributesList);
      });
    }
  }
}

function IsKeyNotPresent(key: string, obj: { [key: string]: string | boolean } | undefined): boolean {
  if (obj) return !(key in obj);
  return true;
}

export function mapHtmlAttributes(index: number, finalAttributeList: IAttributeDetails[], dataItem: IAttributeDetails, attributesList: IAttributeDetails[]) {
  if (finalAttributeList && finalAttributeList[index]) {
    if (dataItem?.validationName && dataItem.validationName !== ATTRIBUTE.EXTENSIONS) {
      if (dataItem?.controlName === CONTROL_TYPES.SELECT || dataItem.controlName === CONTROL_TYPES.MULTISELECT || dataItem.controlName === CONTROL_TYPES.SIMPLE_SELECT) {
        if (finalAttributeList[index]?.controlProperty?.htmlAttributes && IsKeyNotPresent(dataItem?.validationName, finalAttributeList[index]?.controlProperty?.htmlAttributes))
          finalAttributeList[index].controlProperty.htmlAttributes[dataItem.validationName] = dataItem?.subValidationName ?? "";
      } else {
        if (finalAttributeList[index]?.controlProperty?.htmlAttributes && IsKeyNotPresent(dataItem?.validationName, finalAttributeList[index]?.controlProperty?.htmlAttributes))
          finalAttributeList[index].controlProperty.htmlAttributes[dataItem.validationName] = dataItem?.validationValue ?? "";
      }
    } else if (finalAttributeList[index]?.controlProperty?.htmlAttributes && attributesList.filter((x) => x.validationName === ATTRIBUTE.EXTENSIONS).length > 0) {
      if (IsKeyNotPresent(ATTRIBUTE.EXTENSIONS, finalAttributeList[index]?.controlProperty?.htmlAttributes)) {
        const result: string = attributesList
          ?.filter((attribute) => attribute?.validationName === ATTRIBUTE.EXTENSIONS)
          ?.map((attribute) => attribute?.subValidationName)
          .join(",");
        finalAttributeList[index].controlProperty.htmlAttributes[ATTRIBUTE.EXTENSIONS] = result;
      }
    }
  }
}
