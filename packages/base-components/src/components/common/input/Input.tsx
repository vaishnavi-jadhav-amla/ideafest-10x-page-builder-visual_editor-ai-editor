import React, { ChangeEventHandler, FocusEventHandler, KeyboardEvent, KeyboardEventHandler, WheelEventHandler } from "react";

interface InputProps {
  className?: string;
  classPrefix?: string;
  as?: React.ElementType;
  type?: string;
  disabled?: boolean;
  value?: string | number | undefined;
  defaultValue?: string | number | undefined;
  inputRef?: React.RefObject<HTMLInputElement>;
  id?: string;
  size?: "sm" | "md" | "lg";
  plaintext?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  dataTestSelector?: string;
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onWheel?: WheelEventHandler<HTMLInputElement>;
  ariaLabel?: string;
  pattern?: string;
  isLabelShow?: boolean;
  label?: string;
  isRequired?: boolean;
  labelCustomClass?: string;
  labelDataTestSelector?: string;
  name?: string;
  customValidators?: string;
  maxLength?: number;
  accept?: string | undefined;
}

export function Input(props: InputProps) {
  const {
    className,
    classPrefix = "input",
    as: Element = "input",
    type = "text",
    disabled,
    value,
    defaultValue,
    inputRef,
    id,
    size = "md",
    plaintext,
    placeholder,
    readOnly,
    checked = false,
    defaultChecked,
    dataTestSelector,
    onPressEnter,
    onFocus,
    onBlur,
    onKeyDown,
    onChange,
    onWheel,
    ariaLabel,
    pattern,
    isLabelShow,
    label,
    labelCustomClass,
    labelDataTestSelector,
    name,
    isRequired = false,
    maxLength,
    accept = "",
  } = props;

  return (
    <>
      {isLabelShow && (
        <div className="pb-2">
          <label htmlFor={id} className={labelCustomClass} data-test-selector={`${labelDataTestSelector}`}>
            {label}
          </label>
          {isRequired && <strong className="text-errorColor"> *</strong>}
        </div>
      )}
      <Element
        className={`input text-sm px-2
      ${className ? className + " " : ""}${classPrefix} ${size ? `input-${size}` : ""} 
      ${plaintext ? "input-plaintext" : ""} h-10`}
        type={type}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        ref={inputRef}
        id={id}
        readOnly={readOnly}
        {...(accept && { accept: accept })}
        checked={checked}
        defaultChecked={defaultChecked}
        data-test-selector={dataTestSelector}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && onPressEnter) {
            onPressEnter(e);
          }
        }}
        onWheel={onWheel}
        aria-label={ariaLabel ?? "Input Field"}
        {...(pattern && { pattern: pattern ?? "" })}
        name={name}
        require={isRequired ? isRequired : undefined}
        maxLength={maxLength}
      />
    </>
  );
}

export default Input;
