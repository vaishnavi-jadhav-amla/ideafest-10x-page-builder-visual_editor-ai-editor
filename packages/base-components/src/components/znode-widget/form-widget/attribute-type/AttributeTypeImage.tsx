import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { fileUploadAPI } from "../../../../http-request";
import Button from "../../../common/button/Button";
import { useToast } from "../../../../stores";

export function AttributeTypeImage(props: IAttributeTypeProps) {
  const { attribute, formik, attributeValidations } = props;
  const [isLoading, setIsLoading] = useState(false);

  const imageRef = useRef<HTMLInputElement>(null);

  const { success } = useToast();

  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;
  const validations = attributeValidations;

  const allowExtensions = validations["allowExtensions"] && Array.isArray(validations["allowExtensions"]) ? validations["allowExtensions"] : [];

  const multiple: boolean | undefined = validations["hasAllowMultiUpload"];
  const accept = allowExtensions.join(", ");
  const value = formik.values[name];

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const inputFiles = Array.from(event.currentTarget.files || []);

    // Set initial raw value in Formik for validation
    const filesToUpload = multiple ? inputFiles : inputFiles[0];
    await formik.setFieldValue(name, filesToUpload, true);
    formik.setFieldTouched(name, true, false);

    // Clear previous value before validation
    formik.setFieldValue(name, "", false);
    if (imageRef.current) imageRef.current.value = "";

    const errors = await formik.validateForm();
    const hasError = errors[name];
    if (hasError) {
      return; // Skip upload if validation fails
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      inputFiles.forEach((file) => formData.append("files", file, file.name));

      const response = await fileUploadAPI(formData);
      if (response && typeof response === "object" && "fileUpload" in response && response.fileUpload) {
        formik.setFieldValue(name, response.fileUpload);
        success(`${label} uploaded successfully.`);
      } else {
        formik.setFieldValue(name, "", false);
        formik.setFieldTouched(name, true, false);
        formik.setFieldError(name, `Failed to upload ${label}. Please try again or choose a different file.`);
        if (imageRef.current) {
          imageRef.current.value = "";
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleBrowse() {
    if (imageRef.current) {
      imageRef.current.click();
    }
  }

  // Reset File
  useEffect(() => {
    if (!value && imageRef.current) {
      imageRef.current.value = "";
    }
  }, [value]);

  function getDisplayValue() {
    if (value && Array.isArray(value)) {
      const fileNames = value.map((f: { fileName: string }) => f.fileName).join(", ");
      return {
        value: fileNames,
        title: fileNames,
      };
    }

    return {
      value: "",
      title: "",
    };
  }

  const displayValue = getDisplayValue();

  const errorMessage = formik.touched[name] && formik.errors[name] ? (formik.errors[name] as string) : undefined;

  return (
    <FormTextField
      label={label}
      hasRequired={hasRequired}
      helpDescription={helpDescription}
      labelDataSelector={`lbl${name}`}
      customElement={
        <div className="flex gap-1">
          {/* Hidden file input */}
          <input
            ref={imageRef}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            onBlur={() => formik.setFieldTouched(name, true)}
            disabled={isLoading}
            className="hidden" // hides native input
          />

          <input
            type="text"
            readOnly
            data-test-selector={`txt${name}`}
            placeholder={`Select ${accept} File`}
            disabled={isLoading}
            value={displayValue.value}
            title={displayValue.title || ""}
            className="w-full border px-3 py-2 rounded"
            style={{
              cursor: isLoading ? "wait" : "pointer",
            }}
          />

          <Button
            className="cursor-pointer px-4 py-2"
            htmlType="button"
            type="primary"
            disabled={isLoading}
            showLoadingText
            onClick={handleBrowse}
            dataTestSelector="btnBrowseFile"
            loading={isLoading}
            loaderColor="currentColor"
            loaderWidth="20px"
            loaderHeight="20px"
            loaderText="uploading"
          >
            Browse
          </Button>
        </div>
      }
      error={errorMessage}
    />
  );
}
