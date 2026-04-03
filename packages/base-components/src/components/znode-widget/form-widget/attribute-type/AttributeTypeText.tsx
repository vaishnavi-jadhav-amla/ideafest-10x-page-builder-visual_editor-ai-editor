import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";

export function AttributeTypeText(props: IAttributeTypeProps) {
  const { attribute, formik } = props;

  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;

  return (
    <FormTextField
      label={label}
      name={name}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      value={formik.values[name]}
      labelDataSelector={`lbl${name}`}
      inputDataSelector={`txt${name}`}
      hasRequired={hasRequired}
      helpDescription={helpDescription}
      error={formik.touched[name] ? (formik.errors[name] as string) : undefined}
    />
  );
}
