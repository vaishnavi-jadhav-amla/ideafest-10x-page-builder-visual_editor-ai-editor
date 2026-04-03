import { useEffect, useRef, useState } from "react";

import { IAttributeTypeProps } from "@znode/types/form-builder/common";
import { FormTextField } from "../form-field/FormTextField";

export function AttributeTypeSimpleSelect(props: IAttributeTypeProps) {
  const { attribute, formik } = props;
  const label = attribute.attributeName;
  const hasRequired = attribute.isRequired;
  const helpDescription = attribute.helpDescription;
  const name = attribute.attributeCode;
  const options = attribute?.options || [];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen; // keep ref updated with current state
  }, [isOpen]);

  const selected = formik.values[name] ? formik.values[name].split(",").filter(Boolean) : [];

  const toggleDropdown = () => {
    if (isOpen) {
      formik.handleBlur({ target: { name } });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: { code: string; label: string; value: string }) => {
    formik.setFieldValue(name, option.label);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpenRef.current) {
          setIsOpen(false);
          formik.setFieldTouched(name, true);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormTextField
      label={label}
      hasRequired={hasRequired}
      helpDescription={helpDescription}
      labelDataSelector={`lbl${name}`}
      error={formik.touched[name] ? (formik.errors[name] as string) : undefined}
      customElement={
        <div className="relative w-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            className="w-full border border-gray-300  px-4 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <span>{selected.length === 0 ? <span className="text-gray-400">Select {label}</span> : selected.join(", ")}</span>
            <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-300 shadow-lg">
              {options.map((option: { code: string; label: string; value: string }) => (
                <li
                  key={option.code}
                  onClick={() => handleSelect(option)}
                  className={`cursor-pointer select-none px-4 py-2 hover:bg-blue-100 flex items-center ${selected.includes(option.label) ? "bg-blue-100 font-semibold" : ""}`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}
