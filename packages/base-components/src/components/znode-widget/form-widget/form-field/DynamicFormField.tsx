import { attributeTypeMap } from "../attribute-type";
import { IDynamicFormFieldProps } from "@znode/types/form-builder/common";

export function DynamicFormField(props: IDynamicFormFieldProps) {
  const { attributeTypeName, attribute, attributeValidations, formik, generalSettings, RichTextEditorElement } = props;

  const AttributeTypeField = attributeTypeMap.get(attributeTypeName);
  return AttributeTypeField ? (
    <AttributeTypeField
      attributeValidations={attributeValidations}
      attribute={attribute}
      formik={formik}
      generalSettings={generalSettings}
      RichTextEditorElement={RichTextEditorElement}
    />
  ) : null;
}
