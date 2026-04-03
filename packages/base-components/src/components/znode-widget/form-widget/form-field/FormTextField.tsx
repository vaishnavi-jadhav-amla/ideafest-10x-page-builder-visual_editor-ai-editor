/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import { HelpLabel } from "./HelpLabel";
import Input from "../../../common/input/Input";

interface IFormTextFieldProps {
  label: string;
  name?: string;
  value?: string;
  error?: string;
  success?: string;
  onChange?: (_e: React.ChangeEvent<any>) => void;
  onBlur?: (_e: React.FocusEvent<any>) => void;
  type?: string;
  helpDescription?: string;
  hasRequired?: boolean;
  customElement?: ReactNode;
  accept?: string;
  placeholder?: string;

  labelDataSelector?: string;
  inputDataSelector?: string;
  errorDataSelector?: string;
}

export function FormTextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  helpDescription = undefined,
  hasRequired = undefined,
  customElement = undefined,
  accept = undefined,
  success = "",
  placeholder = "",
  inputDataSelector,
  labelDataSelector,
  errorDataSelector,
}: IFormTextFieldProps) {
  return (
    <div>
      <HelpLabel labelDataSelector={labelDataSelector} labelTitle={label} helpDescription={helpDescription} hasRequired={hasRequired} />
      {customElement && customElement}
      {!customElement && (
        <Input
          {...(accept && { accept: accept })}
          {...(placeholder && { placeholder: placeholder })}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full border px-3 py-2 rounded"
          dataTestSelector={inputDataSelector}
        />
      )}
      {error && !success && (
        <p data-test-selector={errorDataSelector ?? "paraError"} className="text-errorColor text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
