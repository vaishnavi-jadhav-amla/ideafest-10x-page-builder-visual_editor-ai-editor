import React from "react";
import { formatTestSelector } from "@znode/utils/common";

interface ValidationMessageProps {
  message?: string;
  dataTestSelector?: string;
  customClass?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ message = "", dataTestSelector = "", customClass = "text-errorColor text-sm mt-1" }) => {
  if (!message) return null;

  return (
    <p className={customClass} data-test-selector={formatTestSelector("val", `${dataTestSelector}`)}>
      {message}
    </p>
  );
};
