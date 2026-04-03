import { DatePicker } from "../../../common/date-picker";
import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";

export function AttributeTypeDate(props: IAttributeTypeProps) {
  const { attribute, formik, generalSettings } = props;
  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;

  return (
    <FormTextField
      inputDataSelector={`txt${name}`}
      labelDataSelector={`lbl${name}`}
      label={label}
      name={label}
      error={formik.touched[name] ? (formik.errors[name] as string) : undefined}
      hasRequired={hasRequired}
      helpDescription={helpDescription}
      customElement={
        <DatePicker
          onDateChange={(e) => {
            formik.setFieldValue(name, e.target.value);
          }}
          onDateBlur={() => {
            formik.setFieldTouched(name, true);
          }}
        
          selectedDate={formik.values[name]}
          dateClasses="w-full rounded"
          generalSetting={generalSettings}
        />
      }
    />
  );
}
