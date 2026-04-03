import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";

export function AttributeTypeLabel(props: IAttributeTypeProps) {
  const { attribute } = props;
  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;

  return (
    <FormTextField
      label={label}
      name={name}
      hasRequired={hasRequired}
      labelDataSelector={`lbl${name}`}
      helpDescription={helpDescription}
      // eslint-disable-next-line react/jsx-no-useless-fragment
      customElement={<></>}
    />
  );
}
