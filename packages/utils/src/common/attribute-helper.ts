import { IAttributeDetails, ISelectValue } from "@znode/types/attribute";

export function getAttributeValue(
  attributes: IAttributeDetails[],
  attributeCode: string,
  valueType: "attributeDefaultValueCode" | "selectValues" | "attributeValues" | "attributeValue" = "selectValues",
  valueIndex = 0,
  valueProperty = "code"
) {
  if (!attributes || !attributeCode) return null;
  if(attributes && attributes.length === 0) return null;
  const attribute = attributes.find((a) => a.attributeCode && a.attributeCode.toLowerCase() === attributeCode.toLowerCase());
  if (!attribute) return null;
  const value = attribute[valueType];
  if (Array.isArray(value)) {
    return value[valueIndex]?.[valueProperty as keyof ISelectValue] || null;
  }

  return value ?? null;
}
