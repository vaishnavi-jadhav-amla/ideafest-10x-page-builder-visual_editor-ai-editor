import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";

export function AttributeTypeYesNo(props: IAttributeTypeProps) {
  const { attribute, formik } = props;
  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;

  return (
    <FormTextField
      label={label}
      name={label}
      hasRequired={hasRequired}
      labelDataSelector={`lbl${name}`}
      helpDescription={helpDescription}
      error={formik.touched[name] ? (formik.errors[name] as string) : undefined}
      customElement={
        <div className="flex items-center gap-4">
          {["Yes", "No"].map((action) => (
            <label key={action} className="flex items-center gap-2">
              <input type="radio" value={action} name={name} onChange={formik.handleChange} checked={formik.values[name] === action} />
              {action === "Yes" ? "Yes" : "No"}
            </label>
          ))}
        </div>
      }
    />
  );
}
