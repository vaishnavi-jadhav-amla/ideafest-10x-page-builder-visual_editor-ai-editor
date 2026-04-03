import React from "react";
import { WIDGET_CONFIGURATION_MESSAGES } from "../../constants/constants";

interface DataStateHandlerProps {
  response: any;
  loadingMessage?: string;
  emptyMessage?: string;
  children: React.ReactNode;
}

const DataStateHandler: React.FC<DataStateHandlerProps> = ({
  response,
  loadingMessage = "Loading...",
  emptyMessage = WIDGET_CONFIGURATION_MESSAGES.SETTINGS_CONFIGURATION_REQUIRED,
  children,
}) => {

  const storeCode = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("storeCode") : "";

  const isLoading = typeof response !== "string" && !response;

  const isEmpty =
    !response || response == "undefined" ||
    (Array.isArray(response) && response.length === 0) ||
    (typeof response === "object" && response !== null && Object.keys(response).length === 0) ||
    (typeof response === "string" && response.trim() === "");

  if (storeCode) {
    if (isLoading) {
      return <div className="data-state-handler-loading-message">{loadingMessage}</div>;
    }
    if (isEmpty) {
      return <div className="data-state-handler-empty-message">{emptyMessage}</div>;
    }
  }

  return <>{children}</>;
};

export default DataStateHandler;
