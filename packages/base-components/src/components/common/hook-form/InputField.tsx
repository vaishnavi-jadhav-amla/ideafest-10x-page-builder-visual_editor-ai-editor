import { IAddressFieldProps } from "@znode/types/address";
import { ValidationMessage } from "../validation-message";
import { formatTestSelector } from "@znode/utils/common";

export const TextInputField: React.FC<IAddressFieldProps> = ({
  label,
  name,
  placeholder = "",
  register,
  error,
  maxLength = 100,
  pattern,
  lengthErrorMessage,
  requiredErrorMessage,
  customError,
  defaultValue,
  type = "text",
}) => (
  <div className="pb-2">
    <div className="pb-2 required">
      <label className="font-semibold" data-test-selector={formatTestSelector("lbl", name)}>
        {label}
        {requiredErrorMessage && <strong className="ml-1 text-errorColor">*</strong>}
      </label>
    </div>
    <input
      aria-label={label}
      className="w-full h-10 px-2 py-1 border rounded-custom border-inputColor hover:border-black active:border-black "
      placeholder={placeholder}
      data-test-selector={formatTestSelector("txt", name)}
      type={type}
      defaultValue={defaultValue}
      {...register(name, {
        required: requiredErrorMessage,
        pattern: pattern && {
          value: pattern.value,
          message: pattern.message,
        },
        validate: (val: string) => {
          if (val && val.length > maxLength) {
            return lengthErrorMessage;
          }
          if (val && val.trim().length === 0) {
            return requiredErrorMessage;
          }
        },
      })}
    />

    {error ? (
      <ValidationMessage message={error.message} customClass="text-errorColor" dataTestSelector={`${name}Error`} />
    ) : customError ? (
      <ValidationMessage message={customError} customClass="text-errorColor" dataTestSelector="customError" />
    ) : null}
  </div>
);
