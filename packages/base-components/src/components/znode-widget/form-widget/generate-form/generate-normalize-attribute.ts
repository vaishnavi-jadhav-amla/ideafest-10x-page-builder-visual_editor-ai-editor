import { IFormAttribute } from "@znode/types/form-builder/get-form";

type IAttributeParams = Array<
  IFormAttribute & {
    options?: Array<{
      code: string;
      label: string;
      value: string;
      displayOrder: number | undefined;
    }>;
  }
>;
export function generateNormalizeAttributes(attributes: IAttributeParams) {
  const result: IAttributeParams = [];

  for (const attr of attributes) {
    const isSelectType = ["Simple Select", "Multi Select"].includes(attr.attributeTypeName);
    const id = attr.globalAttributeId;

    if (isSelectType) {
      const existing = result.find((item) => item.globalAttributeId === id);

      if (existing) {
        if (attr.attributeDefaultValue && attr.attributeDefaultValueCode) {
          existing.options = existing.options || [];
          existing.options.push({
            code: attr.attributeDefaultValueCode,
            label: attr.attributeDefaultValue,
            value: attr.attributeDefaultValue,
            displayOrder: attr.displayOrder,
          });
        }
      } else {
        const clone = { ...attr };
        clone.options = [];

        if (attr.attributeDefaultValue && attr.attributeDefaultValueCode) {
          clone.options.push({
            code: attr.attributeDefaultValueCode,
            label: attr.attributeDefaultValue,
            value: attr.attributeDefaultValue,
            displayOrder: attr.displayOrder,
          });
        }

        result.push(clone);
      }
    } else {
      result.push(attr);
    }
  }

  return result;
}
