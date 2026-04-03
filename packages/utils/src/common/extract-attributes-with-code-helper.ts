/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Extracts values from an array of items based on provided keys and codes.
 * @param items - The array of items to extract values from.
 * @param keys - The array of keys to extract values for.
 * @param codes - The array of codes to extract values for.
 * @returns An object containing codes as keys and their corresponding values.
 */
export const extractValuesByCodes = <T extends Record<string, string>, K extends keyof T>(items: T[] | undefined, keys: K[], codes: string[]): Partial<Record<string, string>> => {
  const extractedValues: Partial<Record<string, string>> = {};

  if (!items || keys.length === 0) {
    return extractedValues;
  }

  // Create a set of codes for efficient lookup
  const codeSet = new Set(codes);

  items.forEach((item: any) => {
    const key = keys[0];
    const value = item[key];

    if (value !== undefined && codeSet.has(value)) {
      extractedValues[value] = item[keys[1] as string];
    }
  });

  return extractedValues;
};

export function extractValuesByCode(allAttributeArray: any, attributeKeys: string[], attributeCodes: any[]) {
  const extractedValues: { [code: string]: [value: string] } | null | any = {};

  if (!allAttributeArray || allAttributeArray.length === 0 || !attributeKeys || attributeKeys.length === 0 || !attributeCodes || attributeCodes.length === 0) {
    return extractedValues;
  }

  attributeCodes.forEach((code) => {
    const attributes: { [key: string]: [value: string] } | null = {};

    attributeKeys.forEach((key) => {
      const index = allAttributeArray.findIndex((attr: { attributeCode: string }) => attr.attributeCode === code);
      if (index !== -1) {
        attributes[key] = allAttributeArray[index][key];
      }
    });

    if (Object.keys(attributes).length > 0) {
      extractedValues[code] = attributes;
    }
  });

  return extractedValues;
}
