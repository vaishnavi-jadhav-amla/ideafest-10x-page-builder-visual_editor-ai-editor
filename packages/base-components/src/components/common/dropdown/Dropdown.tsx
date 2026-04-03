import React from "react";
import { useTranslations } from "next-intl";

interface SelectProps {
  options: Array<{ text: string; value: string }>;
  // eslint-disable-next-line no-unused-vars
  onSelect: (selectedOption: string) => void;
  defaultValue?: number;
  className?: string;
  IsLocalizeNotEnabled?: boolean;
}

export function Dropdown({ options, onSelect, defaultValue, className, IsLocalizeNotEnabled }: Readonly<SelectProps>) {
  const t = useTranslations("Common");
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    onSelect(selectedOption);
  };

  return (
    <select className={className ? className : "block w-full mt-1 bg-white  px-4 py-2 leading-tight border-b h-10"} aria-label={"Select Option"} onChange={handleChange}>
      <option value="">{t("selectAnOption")}</option>
      {options.map((option, index) => (
        <option key={index} value={option?.value} selected={index == defaultValue ? true : false}>
          {option?.text && !IsLocalizeNotEnabled ? t(option?.text) : option?.text}
        </option>
      ))}
    </select>
  );
}
