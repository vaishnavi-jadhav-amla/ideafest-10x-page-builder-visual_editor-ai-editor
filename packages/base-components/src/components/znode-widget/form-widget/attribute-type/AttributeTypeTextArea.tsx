import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";

export function AttributeTypeTextArea(props: IAttributeTypeProps) {
  const { attribute, formik, attributeValidations, RichTextEditorElement } = props;
  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;
  const value = formik.values[name];
  const hasWysiwygEnabled: boolean | undefined = attributeValidations?.hasWysiwygEnabled;

  const CustomElement =
    hasWysiwygEnabled && RichTextEditorElement ? (
      <div>
        <RichTextEditorElement
          editorText={value}
          onEditorTextChange={(val: string) => {
            formik.setFieldValue(name, val);
          }}
          onEditorBlur={() => {
            formik.setFieldTouched(name, true);
          }}
        />
      </div>
    ) : (
      <textarea
        className="input text-sm  px-2 pb-1 w-full border px-3 py-2 rounded input input-md h-40 resize-none"
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        data-test-selector={`txt${name}`}
      />
    );

  return (
    <FormTextField
      label={label}
      name={label}
      hasRequired={hasRequired}
      helpDescription={helpDescription}
      labelDataSelector={`lbl${name}`}
      error={formik.touched[name] ? (formik.errors[name] as string) : undefined}
      customElement={CustomElement}
    />
  );
}
